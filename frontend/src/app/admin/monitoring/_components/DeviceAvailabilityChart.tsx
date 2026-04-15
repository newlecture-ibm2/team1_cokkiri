"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DeviceAvailability } from "../_types";

const SUCCESS_COLOR = "#768064";
const FAILURE_COLOR = "#dc2626";
const WARNING_COLOR = "#d97706";

type SortKey = "successRate" | "totalCount" | "failureCount" | "deviceName" | "floorSpace";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "successRate", label: "성공률" },
  { key: "totalCount", label: "제어 횟수" },
  { key: "failureCount", label: "실패 횟수" },
  { key: "deviceName", label: "기기명" },
  { key: "floorSpace", label: "호실(층)" },
];

interface DeviceAvailabilityChartProps {
  data: DeviceAvailability[];
}

export default function DeviceAvailabilityChart({
  data,
}: DeviceAvailabilityChartProps) {
  const [sortKey, setSortKey] = useState<SortKey>("successRate");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      switch (sortKey) {
        case "successRate":
          return sortDir === "asc"
            ? a.successRate - b.successRate
            : b.successRate - a.successRate;
        case "totalCount":
          return sortDir === "asc"
            ? a.totalCount - b.totalCount
            : b.totalCount - a.totalCount;
        case "failureCount":
          return sortDir === "asc"
            ? a.failureCount - b.failureCount
            : b.failureCount - a.failureCount;
        case "deviceName":
          return sortDir === "asc"
            ? a.deviceName.localeCompare(b.deviceName)
            : b.deviceName.localeCompare(a.deviceName);
        case "floorSpace": {
          const floorA = a.floor ?? 0;
          const floorB = b.floor ?? 0;
          if (floorA !== floorB) {
            return sortDir === "asc" ? floorA - floorB : floorB - floorA;
          }
          // 같은 층이면 호실명(spaceName)으로 정렬
          return sortDir === "asc"
            ? a.spaceName.localeCompare(b.spaceName)
            : b.spaceName.localeCompare(a.spaceName);
        }
        default:
          return 0;
      }
    });
    return sorted;
  }, [data, sortKey, sortDir]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        제어 이력이 없습니다
      </div>
    );
  }

  const chartData = sortedData.map((d) => ({
    name: d.floor ? `${d.floor}F ${d.deviceName}` : d.deviceName,
    spaceName: d.spaceName,
    floor: d.floor,
    deviceTypeName: d.deviceTypeName,
    successRate: d.successRate,
    successCount: d.successCount,
    failureCount: d.failureCount,
    totalCount: d.totalCount,
  }));

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "successRate" ? "asc" : "desc");
    }
  };

  const getBarColor = (rate: number) => {
    if (rate >= 80) return SUCCESS_COLOR;
    if (rate >= 50) return WARNING_COLOR;
    return FAILURE_COLOR;
  };

  return (
    <div>
      {/* 정렬 버튼 그룹 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mr-1">
          정렬
        </span>
        {SORT_OPTIONS.map((opt) => {
          const isActive = sortKey === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => handleSort(opt.key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                isActive
                  ? "bg-primary text-white border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-accent"
              }`}
            >
              {opt.label}
              {isActive && (
                <span className="ml-1">
                  {sortDir === "asc" ? "↑" : "↓"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 차트 */}
      <ResponsiveContainer
        width="100%"
        height={Math.max(300, chartData.length * 36)}
      >
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--secondary)"
            opacity={0.4}
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            axisLine={{ stroke: "var(--secondary)" }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            axisLine={{ stroke: "var(--secondary)" }}
            width={120}
          />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, _name: any, props: any) => {
              const d = props.payload;
              return [
                `${value}% (${d.successCount}/${d.totalCount})`,
                "성공률",
              ];
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            labelFormatter={(label: any, payload: any) => {
              if (payload?.[0]?.payload) {
                const d = payload[0].payload;
                return `${label} · ${d.spaceName} · ${d.deviceTypeName}`;
              }
              return label;
            }}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid var(--secondary)",
              fontSize: "13px",
            }}
          />
          <Bar dataKey="successRate" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {chartData.map((d, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(d.successRate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* 범례 */}
      <div className="flex items-center gap-4 mt-3 justify-end">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: SUCCESS_COLOR }}
          />
          <span className="text-[10px] text-muted-foreground">80%+</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: WARNING_COLOR }}
          />
          <span className="text-[10px] text-muted-foreground">50~79%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: FAILURE_COLOR }}
          />
          <span className="text-[10px] text-muted-foreground">50% 미만</span>
        </div>
      </div>
    </div>
  );
}

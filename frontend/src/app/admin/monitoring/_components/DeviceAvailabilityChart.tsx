"use client";

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

interface DeviceAvailabilityChartProps {
  data: DeviceAvailability[];
}

export default function DeviceAvailabilityChart({
  data,
}: DeviceAvailabilityChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        제어 이력이 없습니다
      </div>
    );
  }

  // 차트용 데이터 가공 — 기기명(공간명) 형태
  const chartData = data.map((d) => ({
    name: `${d.deviceName}`,
    spaceName: d.spaceName,
    deviceTypeName: d.deviceTypeName,
    successRate: d.successRate,
    successCount: d.successCount,
    failureCount: d.failureCount,
    totalCount: d.totalCount,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 40)}>
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
            <Cell
              key={`cell-${index}`}
              fill={d.successRate >= 80 ? SUCCESS_COLOR : FAILURE_COLOR}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

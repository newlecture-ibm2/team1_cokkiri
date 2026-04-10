"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import type { DashboardSpaceDeviceStatus } from "../_api";

const STATUS_COLORS: Record<string, string> = {
  ONLINE: "#768064",
  OFFLINE: "#959581",
  ERROR: "#C94040",
};

interface Props {
  data: DashboardSpaceDeviceStatus[];
  isLoading: boolean;
}

export default function DeviceStatusBySpace({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="animate-pulse h-[250px] bg-[var(--secondary)]/20 rounded-xl" />
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-[var(--muted)] text-sm">
        등록된 기기가 없습니다
      </div>
    );
  }

  // 공간별 집계
  const spaceMap = new Map<
    string,
    { spaceName: string; spaceType: string; ONLINE: number; OFFLINE: number; ERROR: number }
  >();

  data.forEach((item) => {
    if (!spaceMap.has(item.spaceName)) {
      spaceMap.set(item.spaceName, {
        spaceName: item.spaceName,
        spaceType: item.spaceType === "PRIVATE" ? "개인" : "공용",
        ONLINE: 0,
        OFFLINE: 0,
        ERROR: 0,
      });
    }
    const entry = spaceMap.get(item.spaceName)!;
    if (item.status === "ONLINE") entry.ONLINE += item.count;
    else if (item.status === "OFFLINE") entry.OFFLINE += item.count;
    else if (item.status === "ERROR") entry.ERROR += item.count;
  });

  const chartData = Array.from(spaceMap.values()).map((e) => ({
    name: `${e.spaceName} (${e.spaceType})`,
    정상: e.ONLINE,
    오프라인: e.OFFLINE,
    장애: e.ERROR,
  }));

  const chartHeight = Math.max(220, chartData.length * 60);

  return (
    <div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          barCategoryGap="20%"
          barGap={2}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--secondary)"
            opacity={0.3}
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "var(--muted)" }}
            axisLine={{ stroke: "var(--secondary)" }}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 10, fill: "var(--primary)" }}
            axisLine={{ stroke: "var(--secondary)" }}
          />
          <Tooltip
            formatter={(value, name) => [`${value}대`, name]}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid var(--secondary)",
              fontSize: "12px",
            }}
          />
          <Legend
            verticalAlign="top"
            iconType="circle"
            wrapperStyle={{ fontSize: "11px", paddingBottom: "8px" }}
          />
          <Bar dataKey="정상" fill={STATUS_COLORS.ONLINE} radius={[0, 4, 4, 0]} barSize={8} />
          <Bar dataKey="오프라인" fill={STATUS_COLORS.OFFLINE} radius={[0, 4, 4, 0]} barSize={8} />
          <Bar dataKey="장애" fill={STATUS_COLORS.ERROR} radius={[0, 4, 4, 0]} barSize={8} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 text-right">
        <Link
          href="/admin/monitoring"
          className="text-xs font-semibold text-[var(--accent)] hover:underline underline-offset-4 transition-colors"
        >
          상세 모니터링 →
        </Link>
      </div>
    </div>
  );
}

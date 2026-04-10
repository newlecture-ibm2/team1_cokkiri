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
import type { SpaceDeviceStatus } from "../_types";

const STATUS_COLORS: Record<string, string> = {
  ONLINE: "#768064",
  OFFLINE: "#959581",
  ERROR: "#C94040",
};

const STATUS_LABEL: Record<string, string> = {
  ONLINE: "정상",
  OFFLINE: "오프라인",
  ERROR: "장애",
};

interface SpaceDeviceStatusChartProps {
  data: SpaceDeviceStatus[];
}

export default function SpaceDeviceStatusChart({ data }: SpaceDeviceStatusChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-[var(--muted)]">
        등록된 기기가 없습니다
      </div>
    );
  }

  // 공간별로 ONLINE/OFFLINE/ERROR 집계
  const spaceMap = new Map<string, { spaceName: string; spaceType: string; ONLINE: number; OFFLINE: number; ERROR: number }>();

  data.forEach((item) => {
    const key = item.spaceName;
    if (!spaceMap.has(key)) {
      spaceMap.set(key, {
        spaceName: item.spaceName,
        spaceType: item.spaceType === "PRIVATE" ? "개인" : "공용",
        ONLINE: 0,
        OFFLINE: 0,
        ERROR: 0,
      });
    }
    const entry = spaceMap.get(key)!;
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

  const chartHeight = Math.max(300, chartData.length * 50);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" opacity={0.4} horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "var(--muted)" }}
          axisLine={{ stroke: "var(--secondary)" }}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tick={{ fontSize: 11, fill: "var(--primary)" }}
          axisLine={{ stroke: "var(--secondary)" }}
        />
        <Tooltip
          formatter={(value, name) => [`${value}대`, name]}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid var(--secondary)",
            fontSize: "13px",
          }}
        />
        <Legend
          verticalAlign="top"
          iconType="circle"
          wrapperStyle={{ fontSize: "12px", paddingBottom: "12px" }}
        />
        <Bar dataKey="정상" stackId="status" fill={STATUS_COLORS.ONLINE} radius={[0, 0, 0, 0]} />
        <Bar dataKey="오프라인" stackId="status" fill={STATUS_COLORS.OFFLINE} />
        <Bar dataKey="장애" stackId="status" fill={STATUS_COLORS.ERROR} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

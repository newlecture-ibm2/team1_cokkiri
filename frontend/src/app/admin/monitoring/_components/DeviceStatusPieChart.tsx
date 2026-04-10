"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DeviceStatusSummary } from "../_types";

const COLORS = ["#768064", "#959581", "#C94040"];
const LABELS: Record<string, string> = {
  online: "정상 (ONLINE)",
  offline: "오프라인 (OFFLINE)",
  error: "장애 (ERROR)",
};

interface DeviceStatusPieChartProps {
  data: DeviceStatusSummary;
}

export default function DeviceStatusPieChart({ data }: DeviceStatusPieChartProps) {
  const chartData = [
    { name: LABELS.online, value: data.onlineCount },
    { name: LABELS.offline, value: data.offlineCount },
    { name: LABELS.error, value: data.errorCount },
  ].filter((d) => d.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        등록된 기기가 없습니다
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
          label={({ name, percent }) =>
            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {chartData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              stroke="none"
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${value}대`, "기기 수"]}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid var(--secondary)",
            fontSize: "13px",
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

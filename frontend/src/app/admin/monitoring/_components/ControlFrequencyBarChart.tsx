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
import type { ControlFrequency } from "../_types";

const BAR_COLOR = "#768064";
const BAR_HOVER = "#4C583E";

interface ControlFrequencyBarChartProps {
  data: ControlFrequency[];
  title: string;
}

export default function ControlFrequencyBarChart({
  data,
  title,
}: ControlFrequencyBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-[var(--muted)]">
        제어 이력이 없습니다
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[var(--muted)] mb-4">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" opacity={0.4} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            axisLine={{ stroke: "var(--secondary)" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            axisLine={{ stroke: "var(--secondary)" }}
            allowDecimals={false}
          />
          <Tooltip
            formatter={(value) => [`${value}회`, "제어 횟수"]}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid var(--secondary)",
              fontSize: "13px",
            }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={BAR_COLOR} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

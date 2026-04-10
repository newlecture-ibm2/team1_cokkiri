"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ControlFrequency } from "../_types";

interface ErrorTrendChartProps {
  data: ControlFrequency[];
}

export default function ErrorTrendChart({ data }: ErrorTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-[var(--muted)]">
        최근 30일 에러 이력이 없습니다
      </div>
    );
  }

  // 날짜 포맷: 2026-04-07 → 04/07
  const formatted = data.map((d) => ({
    ...d,
    label: d.label.length >= 10 ? d.label.substring(5) : d.label,
  }));

  return (
    <div>
      <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[var(--muted)] mb-4">
        일별 에러 추이 (최근 30일)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorErrorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c0392b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#c0392b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" opacity={0.4} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "var(--muted)" }}
            axisLine={{ stroke: "var(--secondary)" }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            axisLine={{ stroke: "var(--secondary)" }}
            allowDecimals={false}
          />
          <Tooltip
            formatter={(value) => [`${value}회`, "에러 횟수"]}
            labelFormatter={(label) => `날짜: ${label}`}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid var(--secondary)",
              fontSize: "13px",
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#c0392b"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorErrorCount)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

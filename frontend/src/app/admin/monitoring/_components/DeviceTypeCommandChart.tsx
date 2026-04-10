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
import type { DeviceTypeCommandFrequency } from "../_types";

// 명령별 시맨틱 색상 팔레트 (Moss & Aloe 기반 확장)
const COMMAND_COLORS: Record<string, string> = {
  ON: "#768064",       // Olive (accent)
  OFF: "#959581",      // Cedar (secondary)
  SET_TEMP: "#4C583E", // Cypress (muted)
  SET_BRIGHTNESS: "#A3B18A",
  SET_MODE: "#6B705C",
  LOCK: "#2C3424",     // Moss (primary)
  UNLOCK: "#B7B7A4",
  START: "#588157",
  STOP: "#C94040",
};

const DEFAULT_COLOR = "#8B8B78";

interface DeviceTypeCommandChartProps {
  data: DeviceTypeCommandFrequency[];
}

export default function DeviceTypeCommandChart({ data }: DeviceTypeCommandChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        제어 이력이 없습니다
      </div>
    );
  }

  // 기기 종류별로 명령 데이터를 그룹핑
  const deviceTypeMap = new Map<string, Record<string, number>>();
  const allCommands = new Set<string>();

  data.forEach((item) => {
    if (!deviceTypeMap.has(item.deviceTypeName)) {
      deviceTypeMap.set(item.deviceTypeName, {});
    }
    const entry = deviceTypeMap.get(item.deviceTypeName)!;
    entry[item.command] = item.count;
    allCommands.add(item.command);
  });

  // 차트 데이터 생성 — X축 = 기기 종류, 각 막대 = 명령
  const chartData = Array.from(deviceTypeMap.entries()).map(([name, commands]) => ({
    name,
    ...commands,
  }));

  const commandList = Array.from(allCommands);
  const chartHeight = Math.max(320, chartData.length * 60);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        barCategoryGap="20%"
        barGap={2}
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
          width={100}
          tick={{ fontSize: 11, fill: "var(--primary)" }}
          axisLine={{ stroke: "var(--secondary)" }}
        />
        <Tooltip
          formatter={(value, name) => [`${value}회`, name]}
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
        {commandList.map((cmd) => (
          <Bar
            key={cmd}
            dataKey={cmd}
            fill={COMMAND_COLORS[cmd] ?? DEFAULT_COLOR}
            radius={[0, 4, 4, 0]}
            barSize={8}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

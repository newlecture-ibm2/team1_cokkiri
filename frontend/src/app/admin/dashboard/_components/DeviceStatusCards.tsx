"use client";

import type { DashboardDeviceStatus } from "../_api";

interface Props {
  data: DashboardDeviceStatus | null;
  isLoading: boolean;
}

export default function DeviceStatusCards({ data, isLoading }: Props) {
  const cards = [
    {
      label: "ONLINE",
      value: data?.onlineCount ?? 0,
      icon: "🟢",
      color: "var(--accent)",
      bgColor: "var(--accent)",
    },
    {
      label: "OFFLINE",
      value: data?.offlineCount ?? 0,
      icon: "⚪",
      color: "var(--secondary)",
      bgColor: "var(--secondary)",
    },
    {
      label: "ERROR",
      value: data?.errorCount ?? 0,
      icon: "🔴",
      color: "#dc2626",
      bgColor: "#dc2626",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl p-5 border border-[var(--secondary)]/30 
                     hover:shadow-lg transition-all duration-300"
        >
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-[var(--secondary)]/20 rounded w-20" />
              <div className="h-8 bg-[var(--secondary)]/20 rounded w-16" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-black uppercase tracking-[0.3em]"
                  style={{ color: card.color }}
                >
                  {card.label}
                </span>
                <span className="text-lg">{card.icon}</span>
              </div>
              <div
                className="text-3xl font-black tracking-tighter"
                style={{ color: card.color }}
              >
                {card.value}
                <span className="text-sm font-medium text-[var(--muted)] ml-1">
                  대
                </span>
              </div>
              {data && (
                <div className="mt-2 h-1 rounded-full bg-[var(--background)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${data.totalDevices > 0 ? (card.value / data.totalDevices) * 100 : 0}%`,
                      backgroundColor: card.bgColor,
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

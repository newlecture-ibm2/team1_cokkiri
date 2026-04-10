"use client";

import { useRouter } from "next/navigation";
import type { DashboardDeviceStatus } from "../_api";

interface Props {
  data: DashboardDeviceStatus | null;
  isLoading: boolean;
}

export default function DeviceStatusCards({ data, isLoading }: Props) {
  const router = useRouter();

  const cards = [
    {
      label: "TOTAL",
      value: data?.totalDevices ?? 0,
      borderColor: "#2C3424",
      textColor: "#2C3424",
    },
    {
      label: "ONLINE",
      value: data?.onlineCount ?? 0,
      borderColor: "#768064",
      textColor: "#768064",
    },
    {
      label: "OFFLINE",
      value: data?.offlineCount ?? 0,
      borderColor: "#959581",
      textColor: "#959581",
    },
    {
      label: "ERROR",
      value: data?.errorCount ?? 0,
      borderColor: "#dc2626",
      textColor: "#dc2626",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          onClick={() => router.push("/admin/monitoring")}
          className="bg-background rounded-[2rem] border-2 p-5 shadow-sm 
                     hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          style={{ borderColor: card.borderColor }}
        >
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted/20 rounded w-20" />
              <div className="h-8 bg-muted/20 rounded w-16" />
            </div>
          ) : (
            <>
              <div className="mb-2">
                <span
                  className="text-[10px] font-black uppercase tracking-[0.35em]"
                  style={{ color: card.textColor }}
                >
                  {card.label}
                </span>
              </div>
              <div
                className="text-4xl font-black tracking-tighter"
                style={{ color: card.textColor }}
              >
                {card.value}
                <span className="text-sm font-medium text-muted-foreground ml-1">
                  대
                </span>
              </div>
              {data && data.totalDevices > 0 && card.label !== "TOTAL" && (
                <div className="mt-3 h-1 rounded-full bg-muted/20 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(card.value / data.totalDevices) * 100}%`,
                      backgroundColor: card.borderColor,
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

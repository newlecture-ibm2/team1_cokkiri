"use client";

import type { DeviceErrorStats } from "../_types";

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  ERROR: { label: "장애", className: "bg-red-50 text-red-600" },
  ONLINE: { label: "정상", className: "bg-[#768064]/10 text-[#768064]" },
  OFFLINE: { label: "오프라인", className: "bg-muted/20 text-muted-foreground" },
};

interface ErrorDeviceTableProps {
  data: DeviceErrorStats[];
  isLoading: boolean;
}

export default function ErrorDeviceTable({ data, isLoading }: ErrorDeviceTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse h-12 rounded-xl bg-muted/20" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <span className="text-4xl mb-3">✅</span>
        <p className="font-medium">장애 기기가 없습니다</p>
        <p className="text-sm mt-1">모든 기기가 정상 작동 중입니다</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-primary/[0.03] border-b border-primary/10">
            <th className="text-left py-3 px-4 text-[13px] font-black uppercase tracking-widest text-primary/60">
              기기명
            </th>
            <th className="text-left py-3 px-4 text-[13px] font-black uppercase tracking-widest text-primary/60">
              종류
            </th>
            <th className="text-left py-3 px-4 text-[13px] font-black uppercase tracking-widest text-primary/60">
              설치 공간
            </th>
            <th className="text-center py-3 px-4 text-[13px] font-black uppercase tracking-widest text-primary/60">
              상태
            </th>
            <th className="text-center py-3 px-4 text-[13px] font-black uppercase tracking-widest text-primary/60">
              에러 횟수
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((device) => {
            const badge = STATUS_BADGES[device.status] ?? STATUS_BADGES.OFFLINE;
            return (
              <tr
                key={device.deviceId}
                className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors"
              >
                <td className="py-3 px-4 font-semibold text-primary/95">
                  {device.deviceName}
                </td>
                <td className="py-3 px-4 text-primary/60">
                  {device.deviceTypeName}
                </td>
                <td className="py-3 px-4 text-primary/60">
                  {device.spaceName}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="font-bold text-red-500 text-lg">
                    {device.errorCount}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

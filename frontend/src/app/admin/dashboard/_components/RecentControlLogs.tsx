"use client";

import Link from "next/link";
import type { DashboardControlLog } from "../_api";

interface Props {
  logs: DashboardControlLog[];
  isLoading: boolean;
}

export default function RecentControlLogs({ logs, isLoading }: Props) {
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-[var(--secondary)]/30">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--background)] text-left">
              <th className="px-4 py-2.5 font-semibold text-[var(--primary)] text-xs">
                일시
              </th>
              <th className="px-4 py-2.5 font-semibold text-[var(--primary)] text-xs">
                공간
              </th>
              <th className="px-4 py-2.5 font-semibold text-[var(--primary)] text-xs">
                기기
              </th>
              <th className="px-4 py-2.5 font-semibold text-[var(--primary)] text-xs">
                명령
              </th>
              <th className="px-4 py-2.5 font-semibold text-[var(--primary)] text-xs">
                결과
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-[var(--secondary)]/15">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-2.5">
                      <div className="animate-pulse h-3.5 bg-[var(--secondary)]/20 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-[var(--muted)] text-sm"
                >
                  제어 이력이 없습니다
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.controlLogId}
                  className="border-t border-[var(--secondary)]/15 hover:bg-[var(--background)]/40 transition-colors"
                >
                  <td className="px-4 py-2.5 text-[var(--muted)] text-xs whitespace-nowrap">
                    {formatTime(log.createdAt)}
                  </td>
                  <td className="px-4 py-2.5 text-[var(--primary)] text-xs font-medium">
                    {log.spaceName}
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    <span className="text-[var(--primary)]">
                      {log.deviceName}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-[var(--background)] text-[10px] font-mono font-semibold text-[var(--primary)]">
                      {log.command}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {log.result === "SUCCESS" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--accent)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                        성공
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        실패
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-right">
        <Link
          href="/admin/monitoring"
          className="text-xs font-semibold text-[var(--accent)] hover:underline underline-offset-4 transition-colors"
        >
          전체 이력 보기 →
        </Link>
      </div>
    </div>
  );
}

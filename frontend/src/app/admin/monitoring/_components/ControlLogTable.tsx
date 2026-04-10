"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchControlLogs, fetchSpaces } from "../_api";
import type { ControlLog, SpaceOption } from "../_types";

export default function ControlLogTable() {
  const [logs, setLogs] = useState<ControlLog[]>([]);
  const [spaces, setSpaces] = useState<SpaceOption[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [spaceId, setSpaceId] = useState<number | undefined>();
  const [resultFilter, setResultFilter] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  // 공간 목록 로드
  useEffect(() => {
    fetchSpaces()
      .then((data) => {
        if (data) setSpaces(data);
      })
      .catch(() => {});
  }, []);

  // 이력 로드
  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchControlLogs({
        spaceId,
        result: resultFilter,
        p: page,
        s: pageSize,
      });
      if (data) {
        setLogs(data.content || []);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
      }
    } catch (e: unknown) {
      console.error("[ControlLogTable] API Error:", e);
      setError(e instanceof Error ? e.message : "제어 이력을 불러오지 못했습니다");
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [spaceId, resultFilter, page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleSpaceChange = (val: string) => {
    setSpaceId(val ? Number(val) : undefined);
    setPage(0);
  };

  const handleResultChange = (val: string) => {
    setResultFilter(val || undefined);
    setPage(0);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div>
      {/* 에러 표시 */}
      {error && (
        <div className="bg-red-50 text-red-600 rounded-xl p-4 mb-4 text-sm">
          ⚠ {error}
          <button
            onClick={() => loadLogs()}
            className="ml-3 underline text-xs"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 필터 바 */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={spaceId ?? ""}
          onChange={(e) => handleSpaceChange(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[var(--secondary)] bg-white text-sm text-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)] focus:outline-none min-w-[180px]"
        >
          <option value="">전체 공간</option>
          <optgroup label="개인 공간">
            {spaces
              .filter((s) => s.type === "PRIVATE")
              .map((s) => (
                <option key={s.spaceId} value={s.spaceId}>
                  {s.name}
                </option>
              ))}
          </optgroup>
          <optgroup label="공용 시설">
            {spaces
              .filter((s) => s.type === "COMMON")
              .map((s) => (
                <option key={s.spaceId} value={s.spaceId}>
                  {s.name}
                </option>
              ))}
          </optgroup>
        </select>

        <select
          value={resultFilter ?? ""}
          onChange={(e) => handleResultChange(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[var(--secondary)] bg-white text-sm text-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)] focus:outline-none"
        >
          <option value="">전체 결과</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="FAILURE">FAILURE</option>
        </select>

        <span className="flex items-center text-xs text-[var(--muted)] ml-auto">
          총 {totalElements.toLocaleString()}건
        </span>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-xl border border-[var(--secondary)]/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--background)] text-left">
              <th className="px-4 py-3 font-semibold text-[var(--primary)]">일시</th>
              <th className="px-4 py-3 font-semibold text-[var(--primary)]">공간</th>
              <th className="px-4 py-3 font-semibold text-[var(--primary)]">기기</th>
              <th className="px-4 py-3 font-semibold text-[var(--primary)]">명령</th>
              <th className="px-4 py-3 font-semibold text-[var(--primary)]">실행자</th>
              <th className="px-4 py-3 font-semibold text-[var(--primary)]">결과</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-[var(--secondary)]/20">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="animate-pulse h-4 bg-[var(--secondary)]/20 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[var(--muted)]">
                  제어 이력이 없습니다
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.controlLogId}
                  className="border-t border-[var(--secondary)]/20 hover:bg-[var(--background)]/50 transition-colors"
                >
                  <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-[var(--primary)] font-medium">
                    {log.spaceName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[var(--primary)]">{log.deviceName}</div>
                    <div className="text-xs text-[var(--muted)]">{log.deviceTypeName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-lg bg-[var(--background)] text-xs font-mono font-semibold text-[var(--primary)]">
                      {log.command}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      log.actorType === "ADMIN"
                        ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "bg-[var(--secondary)]/20 text-[var(--muted)]"
                    }`}>
                      {log.actorType}
                    </span>
                    {log.userName && (
                      <span className="ml-1 text-xs">{log.userName}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {log.result === "SUCCESS" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                        성공
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
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

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 rounded-lg text-sm border border-[var(--secondary)] bg-white text-[var(--primary)] disabled:opacity-30 hover:bg-[var(--background)] transition-colors"
          >
            이전
          </button>
          <span className="text-sm text-[var(--muted)]">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg text-sm border border-[var(--secondary)] bg-white text-[var(--primary)] disabled:opacity-30 hover:bg-[var(--background)] transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchControlLogs, fetchSpaces, fetchDeviceTypes } from "../_api";
import type { ControlLog, SpaceOption } from "../_types";

export default function ControlLogTable() {
  const [logs, setLogs] = useState<ControlLog[]>([]);
  const [spaces, setSpaces] = useState<SpaceOption[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<Array<{ deviceTypeId: number; name: string }>>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [spaceId, setSpaceId] = useState<number | undefined>();
  const [deviceTypeId, setDeviceTypeId] = useState<number | undefined>();
  const [resultFilter, setResultFilter] = useState<string | undefined>();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  // 공간 + 기기타입 목록 로드
  useEffect(() => {
    fetchSpaces()
      .then((data) => { if (data) setSpaces(data); })
      .catch(() => {});
    fetchDeviceTypes()
      .then((data) => { if (data) setDeviceTypes(data); })
      .catch(() => {});
  }, []);

  // 이력 로드
  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchControlLogs({
        spaceId,
        deviceTypeId,
        result: resultFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
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
  }, [spaceId, deviceTypeId, resultFilter, startDate, endDate, page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleSpaceChange = (val: string) => {
    setSpaceId(val ? Number(val) : undefined);
    setPage(0);
  };

  const handleDeviceTypeChange = (val: string) => {
    setDeviceTypeId(val ? Number(val) : undefined);
    setPage(0);
  };

  const handleResultChange = (val: string) => {
    setResultFilter(val || undefined);
    setPage(0);
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    setPage(0);
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
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

  const formatParams = (params: string | null): string => {
    if (!params) return "";
    try {
      const obj = JSON.parse(params);
      if (typeof obj !== "object" || obj === null) return params;
      return Object.entries(obj)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
    } catch {
      return params;
    }
  };

  return (
    <div>
      {/* 에러 표시 */}
      {error && (
        <div className="bg-red-50 text-red-600 rounded-xl p-4 mb-4 text-sm">
          ⚠ {error}
          <button onClick={() => loadLogs()} className="ml-3 underline text-xs">
            다시 시도
          </button>
        </div>
      )}

      {/* 필터 바 */}
      <div className="rounded-xl border border-border bg-surface p-4 mb-4 space-y-3">
        {/* 날짜 범위 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">기간</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent/40"
          />
          <span className="text-muted-foreground text-xs font-bold">—</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent/40"
          />
        </div>

        {/* 드롭다운 필터 */}
        <div className="flex flex-wrap gap-3">
          <select
            value={spaceId ?? ""}
            onChange={(e) => handleSpaceChange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-accent/30 focus:outline-none min-w-[180px]"
          >
            <option value="">전체 공간</option>
            <optgroup label="개인 공간">
              {spaces
                .filter((s) => s.type === "PRIVATE")
                .map((s) => (
                  <option key={s.spaceId} value={s.spaceId}>{s.name}</option>
                ))}
            </optgroup>
            <optgroup label="공용 시설">
              {spaces
                .filter((s) => s.type === "COMMON")
                .map((s) => (
                  <option key={s.spaceId} value={s.spaceId}>{s.name}</option>
                ))}
            </optgroup>
          </select>

          <select
            value={deviceTypeId ?? ""}
            onChange={(e) => handleDeviceTypeChange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-accent/30 focus:outline-none min-w-[140px]"
          >
            <option value="">전체 기기 타입</option>
            {deviceTypes.map((dt) => (
              <option key={dt.deviceTypeId} value={dt.deviceTypeId}>{dt.name}</option>
            ))}
          </select>

          <select
            value={resultFilter ?? ""}
            onChange={(e) => handleResultChange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-accent/30 focus:outline-none"
          >
            <option value="">전체 결과</option>
            <option value="SUCCESS">성공</option>
            <option value="FAILURE">실패</option>
          </select>

          <span className="flex items-center text-xs text-muted-foreground ml-auto">
            총 {totalElements.toLocaleString()}건
          </span>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/20 text-left">
              <th className="px-4 py-3 font-semibold text-foreground">일시</th>
              <th className="px-4 py-3 font-semibold text-foreground">공간</th>
              <th className="px-4 py-3 font-semibold text-foreground">기기</th>
              <th className="px-4 py-3 font-semibold text-foreground">명령</th>
              <th className="px-4 py-3 font-semibold text-foreground">실행자</th>
              <th className="px-4 py-3 font-semibold text-foreground">결과</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-border/40">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="animate-pulse h-4 bg-muted/20 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  제어 이력이 없습니다
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const paramText = formatParams(log.commandParams);
                return (
                <tr
                  key={log.controlLogId}
                  className={`border-t hover:bg-muted/10 transition-colors ${
                    log.result === "FAILURE" ? "border-red-200/40 bg-red-50/20" : "border-border/40"
                  }`}
                >
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-foreground font-medium">
                    {log.spaceName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-foreground">{log.deviceName}</div>
                    <div className="text-xs text-muted-foreground">{log.deviceTypeName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-lg bg-background text-xs font-semibold text-foreground">
                      {log.commandLabel || log.command}
                    </span>
                    {paramText && (
                      <div className="mt-0.5 text-[10px] text-muted-foreground font-mono">
                        {paramText}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      log.actorType === "ADMIN"
                        ? "bg-accent/10 text-accent"
                        : "bg-muted/20 text-muted-foreground"
                    }`}>
                      {log.actorType === "ADMIN" ? "관리자" : "입주자"}
                    </span>
                    {log.userName && (
                      <span className="ml-1 text-xs">{log.userName}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {log.result === "SUCCESS" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        성공
                      </span>
                    ) : (
                      <div>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          실패
                        </span>
                        {log.errorMessage && (
                          <div className="mt-0.5 text-[10px] text-red-400 break-words">
                            {log.errorMessage}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
                );
              })
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
            className="px-3 py-1.5 rounded-lg text-sm border border-border bg-background text-foreground disabled:opacity-30 hover:bg-muted/10 transition-colors"
          >
            이전
          </button>
          <span className="text-sm text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg text-sm border border-border bg-background text-foreground disabled:opacity-30 hover:bg-muted/10 transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

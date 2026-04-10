"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import ControlLogFilterBar from "./_components/ControlLogFilterBar";
import ControlLogTimeline from "./_components/ControlLogTimeline";
import { fetchMyControlLogs } from "./_api";
import type { ControlLogItem, ControlLogFilters } from "./_types";

const PAGE_SIZE = 20;

export default function DeviceHistoryPage() {
  const [logs, setLogs] = useState<ControlLogItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<ControlLogFilters>({});
  const [error, setError] = useState<string | null>(null);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadLogs = useCallback(
    async (pageNum: number, currentFilters: ControlLogFilters, append: boolean) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchMyControlLogs(currentFilters, pageNum, PAGE_SIZE);
        const data = response.data;
        if (data) {
          setLogs((prev) => (append ? [...prev, ...data.content] : data.content));
          setPage(data.page);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
          // 첫 페이지 요청 시에만 전체 통계 갱신 (백엔드 집계)
          if (!append) {
            setSuccessCount(data.successCount ?? 0);
            setFailureCount(data.failureCount ?? 0);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "이력을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 초기 로드
  useEffect(() => {
    loadLogs(0, filters, false);
  }, []);

  // 필터 변경
  function handleFilterChange(newFilters: ControlLogFilters) {
    setFilters(newFilters);
    setLogs([]);
    setPage(0);
    loadLogs(0, newFilters, false);
  }

  // 무한 스크롤: IntersectionObserver
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && page + 1 < totalPages) {
          loadLogs(page + 1, filters, true);
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [isLoading, page, totalPages, filters, loadLogs]);

  /* ── 통계 요약 (백엔드 전체 집계 기준) ── */

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 px-6 pt-16 md:px-12 md:pt-32"
    >
      {/* ── 헤더 (my-devices 스타일) ── */}
      <header className="space-y-2">
        <p className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Control Logs
        </p>
        <h1 className="text-3xl font-black tracking-tighter text-primary md:text-4xl">
          기기 제어 이력
        </h1>
        <p className="text-sm font-medium tracking-tight text-muted-foreground text-balance">
          내 기기 제어 기록을 시간순으로 확인하세요.
        </p>
      </header>

      {/* ── 통계 카드 ── */}
      {totalElements > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[2rem] border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-black tracking-tighter text-primary">{totalElements}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1">
              전체
            </p>
          </div>
          <div className="rounded-[2rem] border border-green-400/30 bg-green-50/50 p-4 text-center">
            <p className="text-2xl font-black tracking-tighter text-green-600">{successCount}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600/60 mt-1">
              성공
            </p>
          </div>
          <div className="rounded-[2rem] border border-red-400/30 bg-red-50/50 p-4 text-center">
            <p className="text-2xl font-black tracking-tighter text-red-500">{failureCount}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60 mt-1">
              실패
            </p>
          </div>
        </div>
      )}

      {/* ── 필터 바 ── */}
      <ControlLogFilterBar onFilterChange={handleFilterChange} />

      {/* ── 에러 ── */}
      {error && (
        <div className="rounded-[2rem] border border-destructive/30 bg-destructive/10 p-6 text-center">
          <p className="text-sm font-medium text-destructive">⚠ {error}</p>
          <button
            onClick={() => loadLogs(0, filters, false)}
            className="mt-3 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* ── 타임라인 ── */}
      <ControlLogTimeline logs={logs} isLoading={isLoading} />

      {/* ── 무한 스크롤 sentinel ── */}
      <div ref={sentinelRef} className="h-4" />

      {/* ── 로딩 표시 ── */}
      {isLoading && logs.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── 끝 표시 ── */}
      {!isLoading && logs.length > 0 && page + 1 >= totalPages && (
        <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground py-8">
          All logs loaded
        </p>
      )}
    </motion.div>
  );
}

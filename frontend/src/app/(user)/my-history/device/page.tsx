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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-[900px] mx-auto px-6 py-8"
    >
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter text-[var(--primary)]">
          기기 제어 이력
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          내 기기 제어 기록을 시간순으로 확인할 수 있습니다
          {totalElements > 0 && (
            <span className="ml-2 text-[var(--accent)] font-semibold">
              총 {totalElements}건
            </span>
          )}
        </p>
      </div>

      {/* 필터 바 */}
      <ControlLogFilterBar onFilterChange={handleFilterChange} />

      {/* 에러 */}
      {error && (
        <div className="bg-red-50 text-red-600 rounded-2xl p-4 mb-6 text-sm">
          ⚠ {error}
        </div>
      )}

      {/* 타임라인 */}
      <ControlLogTimeline logs={logs} isLoading={isLoading} />

      {/* 무한 스크롤 sentinel */}
      <div ref={sentinelRef} className="h-4" />

      {/* 로딩 표시 */}
      {isLoading && logs.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 끝 표시 */}
      {!isLoading && logs.length > 0 && page + 1 >= totalPages && (
        <p className="text-center text-sm text-[var(--muted)] py-6">
          모든 이력을 불러왔습니다
        </p>
      )}
    </motion.div>
  );
}

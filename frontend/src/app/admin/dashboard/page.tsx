"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DeviceStatusCards from "./_components/DeviceStatusCards";
import SummaryStatusCards from "./_components/SummaryStatusCards";
import RecentControlLogs from "./_components/RecentControlLogs";
import {
  fetchDashboardEnergy,
  fetchDashboardRecentLogs,
  fetchDashboardSummary,
} from "./_api";
import type {
  DashboardDeviceStatus,
  DashboardControlLog,
  DashboardSummary,
} from "./_api";

export default function DashboardPage() {
  const [statusSummary, setStatusSummary] =
    useState<DashboardDeviceStatus | null>(null);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [recentLogs, setRecentLogs] = useState<DashboardControlLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setIsLoading(true);

      // 각 API 독립 호출 — 하나 실패해도 나머지 표시
      try {
        const energy = await fetchDashboardEnergy();
        if (mounted && energy) {
          setStatusSummary(energy.statusSummary);
        }
      } catch (_e) {
        // 에너지 API 실패 시 빈 상태 유지
      }

      try {
        const summary = await fetchDashboardSummary();
        if (mounted && summary) {
          setDashboardSummary(summary);
        }
      } catch (_e) {
        // 요약 API 실패 시 빈 상태 유지
      }

      try {
        const logs = await fetchDashboardRecentLogs();
        if (mounted && logs) {
          setRecentLogs(logs.content || []);
        }
      } catch (_e) {
        // 로그 API 실패 시 빈 상태 유지
      }

      if (mounted) setIsLoading(false);
    }
    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-[1400px] mx-auto"
    >
      {/* 페이지 헤더 */}
      <header className="mb-12">
        <div className="flex flex-col gap-6">
          <div className="border-b border-primary/10 pb-8 space-y-4">
            <p className="font-black text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Admin · Dashboard</p>
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight uppercase whitespace-nowrap">
              ADMIN <span className="underline underline-offset-4 decoration-accent">DASHBOARD.</span>
              <span className="text-2xl md:text-4xl font-bold tracking-normal ml-2 align-bottom opacity-80">대시보드</span>
            </h1>
            <p className="font-medium tracking-tight text-foreground/70 text-sm md:text-base">
              코리빙 시설의 전반적인 운영 지표와 실시간 현황을 한눈에 파악할 수 있는 요약 보드입니다.
            </p>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          운영 현황 및 기기 상태 섹션
          ══════════════════════════════════════════════ */}
      <section>
        {/* ROW 1: 운영 요약 카드 */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#768064] animate-pulse" />
          <h2 className="text-lg font-black tracking-tighter text-foreground">
            운영 현황 요약
          </h2>
        </div>
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="mb-12"
        >
           <SummaryStatusCards data={dashboardSummary} isLoading={isLoading} />
        </motion.div>

        {/* ROW 2: 기기 요약 카드 */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#768064] animate-pulse" />
          <h2 className="text-lg font-black tracking-tighter text-foreground">
            실시간 기기 현황
          </h2>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <DeviceStatusCards data={statusSummary} isLoading={isLoading} />
        </motion.div>

        {/* ROW 3: 최근 제어 이력 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border-border bg-background rounded-[2rem] border p-6 shadow-sm"
        >
          <h3 className="text-sm font-black tracking-tight text-foreground mb-3">
            최근 기기 제어 이력
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              최신 30건
            </span>
          </h3>
          <RecentControlLogs logs={recentLogs} isLoading={isLoading} />
        </motion.div>
      </section>
    </motion.div>
  );
}

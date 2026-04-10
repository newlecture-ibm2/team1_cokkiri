"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DeviceStatusCards from "./_components/DeviceStatusCards";
import RecentControlLogs from "./_components/RecentControlLogs";
import {
  fetchDashboardEnergy,
  fetchDashboardRecentLogs,
} from "./_api";
import type {
  DashboardDeviceStatus,
  DashboardControlLog,
} from "./_api";

export default function DashboardPage() {
  const [statusSummary, setStatusSummary] =
    useState<DashboardDeviceStatus | null>(null);
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
      <div className="mb-12">
        <p className="text-muted-foreground text-[10px] font-black tracking-[0.35em] uppercase">
          Admin · Dashboard
        </p>
        <h1 className="text-[12vw] leading-[0.85] font-black tracking-tighter text-[#2C3424] uppercase md:text-[6vw] mt-4">
          Dash<span className="text-[#768064]">board</span>
        </h1>
        <p className="max-w-2xl text-base font-medium tracking-tight text-balance text-[#4C583E] md:text-lg mt-5">
          코리빙 시설 운영 현황을 한눈에 확인합니다
        </p>
      </div>

      {/* ══════════════════════════════════════════════
          실시간 기기 현황 섹션
          ══════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#768064] animate-pulse" />
          <h2 className="text-lg font-black tracking-tighter text-foreground">
            실시간 기기 현황
          </h2>
        </div>

        {/* ROW 1: 기기 요약 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <DeviceStatusCards data={statusSummary} isLoading={isLoading} />
        </motion.div>

        {/* ROW 2: 최근 제어 이력 */}
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

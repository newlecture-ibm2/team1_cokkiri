"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DeviceStatusCards from "./_components/DeviceStatusCards";
import DeviceStatusBySpace from "./_components/DeviceStatusBySpace";
import RecentControlLogs from "./_components/RecentControlLogs";
import {
  fetchDashboardEnergy,
  fetchDashboardRecentLogs,
} from "./_api";
import type {
  DashboardDeviceStatus,
  DashboardSpaceDeviceStatus,
  DashboardControlLog,
} from "./_api";

export default function DashboardPage() {
  const [statusSummary, setStatusSummary] =
    useState<DashboardDeviceStatus | null>(null);
  const [spaceStatus, setSpaceStatus] = useState<DashboardSpaceDeviceStatus[]>(
    []
  );
  const [recentLogs, setRecentLogs] = useState<DashboardControlLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);

      // 각 API 독립 호출 — 하나 실패해도 나머지 표시
      try {
        const energy = await fetchDashboardEnergy();
        if (energy) {
          setStatusSummary(energy.statusSummary);
          setSpaceStatus(energy.deviceStatusBySpace || []);
        }
      } catch (_e) {
        // 에너지 API 실패 시 빈 상태 유지
      }

      try {
        const logs = await fetchDashboardRecentLogs();
        if (logs) {
          setRecentLogs(logs.content || []);
        }
      } catch (_e) {
        // 로그 API 실패 시 빈 상태 유지
      }

      setIsLoading(false);
    }
    load();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-[1400px] mx-auto"
    >
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter text-[var(--primary)]">
          대시보드
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          코리빙 시설 운영 현황을 한눈에 확인합니다
        </p>
      </div>

      {/* ══════════════════════════════════════════════
          실시간 기기 현황 섹션
          ══════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <h2 className="text-lg font-bold text-[var(--primary)]">
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

        {/* ROW 2: 공간별 기기 상태 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-[var(--secondary)]/30 mb-6"
        >
          <h3 className="text-sm font-bold text-[var(--primary)] mb-3">
            공간별 기기 상태
          </h3>
          <DeviceStatusBySpace data={spaceStatus} isLoading={isLoading} />
        </motion.div>

        {/* ROW 3: 최근 제어 이력 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-[var(--secondary)]/30"
        >
          <h3 className="text-sm font-bold text-[var(--primary)] mb-3">
            최근 기기 제어 이력
            <span className="ml-2 text-xs font-normal text-[var(--muted)]">
              최신 30건
            </span>
          </h3>
          <RecentControlLogs logs={recentLogs} isLoading={isLoading} />
        </motion.div>
      </section>
    </motion.div>
  );
}

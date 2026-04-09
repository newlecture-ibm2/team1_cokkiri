"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DeviceStatusPieChart from "./_components/DeviceStatusPieChart";
import ControlFrequencyBarChart from "./_components/ControlFrequencyBarChart";
import DailyTrendChart from "./_components/DailyTrendChart";
import ErrorTrendChart from "./_components/ErrorTrendChart";
import ErrorDeviceTable from "./_components/ErrorDeviceTable";
import { fetchDeviceErrors, fetchEnergyStats } from "./_api";
import type { DeviceErrorStats, EnergyStatsResponse } from "./_types";

export default function MonitoringPage() {
  const [errors, setErrors] = useState<DeviceErrorStats[]>([]);
  const [energyData, setEnergyData] = useState<EnergyStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [errorsRes, energyRes] = await Promise.all([
          fetchDeviceErrors(),
          fetchEnergyStats(),
        ]);
        if (errorsRes.data) setErrors(errorsRes.data);
        if (energyRes.data) setEnergyData(energyRes.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-[1200px] mx-auto px-6 md:px-12 py-8"
    >
      {/* 헤더 */}
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tighter text-[var(--primary)]">
          기기 모니터링
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          기기 상태, 제어 빈도, 에러 이력을 한눈에 확인합니다
        </p>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="bg-red-50 text-red-600 rounded-2xl p-4 mb-6 text-sm">
          ⚠ {error}
        </div>
      )}

      {/* ─── ROW 1: 기기 상태 요약 + 종류별 제어 빈도 ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 파이차트: 기기 상태 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-[var(--secondary)]/30"
        >
          <h2 className="text-lg font-bold text-[var(--primary)] mb-4">
            기기 상태 현황
          </h2>
          {energyData ? (
            <>
              <DeviceStatusPieChart data={energyData.statusSummary} />
              <div className="flex justify-center gap-8 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-[var(--primary)]">
                    {energyData.statusSummary.totalDevices}
                  </p>
                  <p className="text-xs text-[var(--muted)] uppercase tracking-wider">전체</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-[#768064]">
                    {energyData.statusSummary.onlineCount}
                  </p>
                  <p className="text-xs text-[var(--muted)] uppercase tracking-wider">정상</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-red-500">
                    {energyData.statusSummary.errorCount}
                  </p>
                  <p className="text-xs text-[var(--muted)] uppercase tracking-wider">장애</p>
                </div>
              </div>
            </>
          ) : isLoading ? (
            <div className="animate-pulse h-[300px] bg-[var(--secondary)]/20 rounded-xl" />
          ) : null}
        </motion.div>

        {/* 바차트: 기기 종류별 제어 빈도 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-[var(--secondary)]/30"
        >
          <h2 className="text-lg font-bold text-[var(--primary)] mb-4">
            기기 종류별 제어 빈도
          </h2>
          {energyData ? (
            <ControlFrequencyBarChart
              data={energyData.frequencyByType}
              title=""
            />
          ) : isLoading ? (
            <div className="animate-pulse h-[300px] bg-[var(--secondary)]/20 rounded-xl" />
          ) : null}
        </motion.div>
      </div>

      {/* ─── ROW 2: 공간별 제어 빈도 + 명령별 제어 빈도 ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 바차트: 공간 타입별 (개인/공용) 제어 빈도 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-6 border border-[var(--secondary)]/30"
        >
          <h2 className="text-lg font-bold text-[var(--primary)] mb-4">
            공간별 제어 빈도
          </h2>
          <p className="text-xs text-[var(--muted)] -mt-2 mb-4">
            개인 공간과 공용 공간의 기기 제어 횟수 비교
          </p>
          {energyData ? (
            <ControlFrequencyBarChart
              data={energyData.frequencyBySpaceType}
              title=""
            />
          ) : isLoading ? (
            <div className="animate-pulse h-[300px] bg-[var(--secondary)]/20 rounded-xl" />
          ) : null}
        </motion.div>

        {/* 바차트: 명령(동작)별 제어 빈도 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-[var(--secondary)]/30"
        >
          <h2 className="text-lg font-bold text-[var(--primary)] mb-4">
            명령별 제어 빈도
          </h2>
          <p className="text-xs text-[var(--muted)] -mt-2 mb-4">
            ON, OFF, SET_TEMP 등 수행된 동작별 횟수
          </p>
          {energyData ? (
            <ControlFrequencyBarChart
              data={energyData.frequencyByCommand}
              title=""
            />
          ) : isLoading ? (
            <div className="animate-pulse h-[300px] bg-[var(--secondary)]/20 rounded-xl" />
          ) : null}
        </motion.div>
      </div>

      {/* ─── ROW 3: 일별 제어 추이 ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white rounded-2xl p-6 border border-[var(--secondary)]/30 mb-8"
      >
        <h2 className="text-lg font-bold text-[var(--primary)] mb-4">
          제어 추이
        </h2>
        {energyData ? (
          <DailyTrendChart data={energyData.dailyFrequency} />
        ) : isLoading ? (
          <div className="animate-pulse h-[300px] bg-[var(--secondary)]/20 rounded-xl" />
        ) : null}
      </motion.div>

      {/* ─── ROW 4: 에러 추이 ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 border border-[var(--secondary)]/30 mb-8"
      >
        <h2 className="text-lg font-bold text-[var(--primary)] mb-4">
          에러 추이
          <span className="ml-2 text-sm font-normal text-[var(--muted)]">
            FAILURE 결과 일별 빈도
          </span>
        </h2>
        {energyData ? (
          <ErrorTrendChart data={energyData.dailyErrorFrequency} />
        ) : isLoading ? (
          <div className="animate-pulse h-[300px] bg-[var(--secondary)]/20 rounded-xl" />
        ) : null}
      </motion.div>

      {/* ─── ROW 5: 장애 기기 테이블 ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-white rounded-2xl p-6 border border-[var(--secondary)]/30"
      >
        <h2 className="text-lg font-bold text-[var(--primary)] mb-4">
          장애·에러 빈발 기기
          {errors.length > 0 && (
            <span className="ml-2 text-sm font-normal text-[var(--muted)]">
              상위 {errors.length}건
            </span>
          )}
        </h2>
        <ErrorDeviceTable data={errors} isLoading={isLoading} />
      </motion.div>
    </motion.div>
  );
}

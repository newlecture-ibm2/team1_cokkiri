"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import SpaceDeviceStatusChart from "./_components/SpaceDeviceStatusChart";
import ControlFrequencyBarChart from "./_components/ControlFrequencyBarChart";
import DeviceTypeCommandChart from "./_components/DeviceTypeCommandChart";
import DailyTrendChart from "./_components/DailyTrendChart";
import ErrorTrendChart from "./_components/ErrorTrendChart";
import ErrorDeviceTable from "./_components/ErrorDeviceTable";
import ControlLogTable from "./_components/ControlLogTable";
import DeviceAvailabilityChart from "./_components/DeviceAvailabilityChart";
import { fetchDeviceErrors, fetchEnergyStats } from "./_api";
import type { DeviceErrorStats, EnergyStatsResponse } from "./_types";

const AUTO_REFRESH_INTERVAL = 30_000; // 30초

export default function MonitoringPage() {
  const [errors, setErrors] = useState<DeviceErrorStats[]>([]);
  const [energyData, setEnergyData] = useState<EnergyStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    const errs: string[] = [];

    try {
      const errorsRes = await fetchDeviceErrors();
      if (errorsRes.data) setErrors(errorsRes.data);
    } catch {
      errs.push("장애 기기");
    }

    try {
      const energyRes = await fetchEnergyStats();
      if (energyRes.data) setEnergyData(energyRes.data);
    } catch {
      errs.push("에너지 통계");
    }

    if (errs.length > 0) {
      setError(`${errs.join(", ")} 데이터를 불러오지 못했습니다.`);
    }
    setIsLoading(false);
    setLastUpdated(new Date());
  }, []);

  // 초기 로드
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // 자동 새로고침 (30초)
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => loadData(false), AUTO_REFRESH_INTERVAL);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, loadData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-[1400px] mx-auto"
    >
      {/* 헤더 */}
      <header className="mb-12">
        <div className="flex flex-col gap-6">
          <div className="border-b border-primary/10 pb-8 space-y-4">
            <p className="font-black text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Admin · Monitoring</p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight uppercase whitespace-nowrap">
                DEVICE <span className="underline underline-offset-4 decoration-accent">MONITOR.</span>
                <span className="text-2xl md:text-4xl font-bold tracking-normal ml-2 align-bottom opacity-80">기기 모니터링</span>
              </h1>
              <div className="flex items-center gap-3 shrink-0">
                {lastUpdated && (
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    {lastUpdated.toLocaleTimeString("ko-KR")} 갱신
                  </span>
                )}
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border transition-all ${
                    autoRefresh
                      ? "bg-accent text-white border-accent shadow-md"
                      : "bg-primary/5 text-primary/40 border-primary/10 hover:bg-primary/10"
                  }`}
                >
                  {autoRefresh ? "● LIVE" : "○ MANUAL"}
                </button>
              </div>
            </div>
            <p className="font-medium tracking-tight text-foreground/70 text-sm md:text-base">
              전체 기기의 실시간 작동 상태, 제어 성공률 및 에러 로그를 분석하여 시스템의 안정성을 모니터링합니다.
            </p>
          </div>
        </div>
      </header>

      {/* 에러 표시 */}
      {error && (
        <div className="bg-red-50 text-red-600 rounded-[2rem] p-4 mb-6 text-sm">
          ⚠ {error}
        </div>
      )}

      {/* ─── 상단 요약 카드 ─── */}
      {energyData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="border-border bg-background rounded-[2rem] border p-5 text-center shadow-sm">
            <p className="text-3xl font-black text-foreground">
              {energyData.statusSummary.totalDevices}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">전체 기기</p>
          </div>
          <div className="border-border bg-background rounded-[2rem] border p-5 text-center shadow-sm">
            <p className="text-3xl font-black text-[#768064]">
              {energyData.statusSummary.onlineCount}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">정상 (ONLINE)</p>
          </div>
          <div className="border-border bg-background rounded-[2rem] border p-5 text-center shadow-sm">
            <p className="text-3xl font-black text-[#959581]">
              {energyData.statusSummary.offlineCount}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">오프라인 (OFFLINE)</p>
          </div>
          <div className="border-border bg-background rounded-[2rem] border p-5 text-center shadow-sm">
            <p className="text-3xl font-black text-red-500">
              {energyData.statusSummary.errorCount}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">장애 (ERROR)</p>
          </div>
        </motion.div>
      )}

      {/* ─── ROW 1: 공간별 기기 상태 현황 (스택 바차트) ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-border bg-background rounded-[2rem] border p-6 shadow-sm mb-8"
      >
        <h2 className="text-lg font-black tracking-tighter text-foreground mb-1">
          공간별 기기 상태 현황
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          각 공간의 기기 수를 상태별(정상 / 오프라인 / 장애)로 표시합니다
        </p>
        {energyData ? (
          <SpaceDeviceStatusChart data={energyData.deviceStatusBySpace} />
        ) : isLoading ? (
          <div className="animate-pulse h-[300px] bg-muted/20 rounded-xl" />
        ) : null}
      </motion.div>

      {/* ─── ROW 2: 기기 종류별 명령 제어 빈도 (교차 집계) ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="border-border bg-background rounded-[2rem] border p-6 shadow-sm mb-8"
      >
        <h2 className="text-lg font-black tracking-tighter text-foreground mb-1">
          기기 종류별 명령 제어 빈도
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          각 기기 종류에서 수행된 명령(ON, OFF, SET_TEMP 등) 횟수를 비교합니다
        </p>
        {energyData ? (
          <DeviceTypeCommandChart data={energyData.frequencyByDeviceTypeAndCommand} />
        ) : isLoading ? (
          <div className="animate-pulse h-[300px] bg-muted/20 rounded-xl" />
        ) : null}
      </motion.div>

      {/* ─── ROW 3: 공간별 제어 빈도 ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border-border bg-background rounded-[2rem] border p-6 shadow-sm mb-8"
      >
        <h2 className="text-lg font-black tracking-tighter text-foreground mb-1">
          공간별 제어 빈도
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          개인 공간과 공용 공간의 기기 제어 횟수 비교
        </p>
        {energyData ? (
          <ControlFrequencyBarChart data={energyData.frequencyBySpaceType} title="" />
        ) : isLoading ? (
          <div className="animate-pulse h-[300px] bg-muted/20 rounded-xl" />
        ) : null}
      </motion.div>

      {/* ─── ROW 4: 일별 제어 추이 ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="border-border bg-background rounded-[2rem] border p-6 shadow-sm mb-8"
      >
        <h2 className="text-lg font-black tracking-tighter text-foreground mb-4">
          제어 추이
        </h2>
        {energyData ? (
          <DailyTrendChart data={energyData.dailyFrequency} />
        ) : isLoading ? (
          <div className="animate-pulse h-[300px] bg-muted/20 rounded-xl" />
        ) : null}
      </motion.div>

      {/* ─── ROW 5: 에러 추이 ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="border-border bg-background rounded-[2rem] border p-6 shadow-sm mb-8"
      >
        <h2 className="text-lg font-black tracking-tighter text-foreground mb-4">
          에러 추이
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            FAILURE 결과 일별 빈도
          </span>
        </h2>
        {energyData ? (
          <ErrorTrendChart data={energyData.dailyErrorFrequency} />
        ) : isLoading ? (
          <div className="animate-pulse h-[300px] bg-muted/20 rounded-xl" />
        ) : null}
      </motion.div>

      {/* ─── ROW 6: 기기별 제어 성공률 ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="border-border bg-background rounded-[2rem] border p-6 shadow-sm mb-8"
      >
        <h2 className="text-lg font-black tracking-tighter text-foreground mb-1">
          기기별 제어 성공률
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          최근 30일 기준, 제어 이력이 있는 기기의 성공/실패 비율
        </p>
        {energyData ? (
          <DeviceAvailabilityChart data={energyData.deviceAvailability} />
        ) : isLoading ? (
          <div className="animate-pulse h-[300px] bg-muted/20 rounded-xl" />
        ) : null}
      </motion.div>

      {/* ─── ROW 7: 장애 기기 테이블 ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="border-border bg-background rounded-[2rem] border p-6 shadow-sm"
      >
        <h2 className="text-lg font-black tracking-tighter text-foreground mb-4">
          장애·에러 빈발 기기
          {errors.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              상위 {errors.length}건
            </span>
          )}
        </h2>
        <ErrorDeviceTable data={errors} isLoading={isLoading} />
      </motion.div>

      {/* ─── ROW 8: 제어 이력 테이블 ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="border-border bg-background rounded-[2rem] border p-6 shadow-sm mt-8"
      >
        <h2 className="text-lg font-black tracking-tighter text-foreground mb-1">
          기기 제어 이력
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          모든 공간의 기기 제어 로그를 조회하고, 호실이나 공용시설로 필터링할 수 있습니다
        </p>
        <ControlLogTable />
      </motion.div>
    </motion.div>
  );
}

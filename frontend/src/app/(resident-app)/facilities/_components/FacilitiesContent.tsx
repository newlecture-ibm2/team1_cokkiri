"use client";

// #78: 공용시설 예약 페이지
// functional-specification §3.2.1~3.2.3
// ui-guideline: Moss & Aloe Editorial 스타일

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Building2 } from "lucide-react";
import { FacilityCard } from "./FacilityCard";
import { WeeklyTimetable } from "./WeeklyTimetable";
import { fetchFacilities } from "../_api";
import type { Facility } from "../_types";
import { ApiError } from "@/lib/api";

export default function FacilitiesContent() {
  const searchParams = useSearchParams();
  const initialSpaceId = searchParams.get("spaceId");

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selected, setSelected] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFacilities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchFacilities();
      const data = res.data ?? [];
      setFacilities(data);
      // spaceId 쿼리 파라미터가 있으면 해당 시설 자동 선택, 없으면 첫 예약 가능 시설
      const targeted = initialSpaceId
        ? data.find((f) => String(f.spaceId) === initialSpaceId)
        : null;
      const first = targeted ?? data.find((f) => f.isReservable) ?? data[0] ?? null;
      setSelected(first);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError("시설 목록을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <p className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Facilities
        </p>
        <h1 className="text-3xl font-black tracking-tighter text-primary md:text-4xl">
          공용시설 예약
        </h1>
        <p className="text-sm font-medium tracking-tight text-muted-foreground text-balance">
          시설을 선택하고 원하는 시간대를 예약하세요.
        </p>
      </motion.header>

      {/* 시설 목록 */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-[2rem] bg-muted/30" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[2rem] border border-destructive/30 bg-destructive/10 p-8 text-center">
          <p className="text-sm font-medium text-destructive">{error}</p>
          <button
            onClick={loadFacilities}
            className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
          >
            다시 시도
          </button>
        </div>
      ) : facilities.length === 0 ? (
        <div className="rounded-[2rem] border border-border bg-surface p-12 text-center">
          <div className="flex justify-center text-muted-foreground/40 mb-3">
            <Building2 size={40} strokeWidth={1} />
          </div>
          <p className="mt-2 text-sm font-semibold text-primary">등록된 시설이 없습니다</p>
          <p className="mt-1 text-xs text-muted-foreground">관리자에게 문의해 주세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {facilities.map((facility, idx) => (
            <FacilityCard
              key={facility.spaceId}
              facility={facility}
              selected={selected?.spaceId === facility.spaceId}
              onSelect={setSelected}
              index={idx}
            />
          ))}
        </div>
      )}

      {/* 타임테이블 */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.section
            key={selected.spaceId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* 섹션 헤더 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  Timetable
                </p>
                <h2 className="text-xl font-black tracking-tighter text-primary">
                  {selected.name}
                </h2>
              </div>
              {!selected.isReservable && (
                <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[10px] font-bold text-accent">
                  자유 이용
                </span>
              )}
            </div>

            {selected.isReservable ? (
              <WeeklyTimetable
                facility={selected}
                onReserved={loadFacilities}
              />
            ) : (
              <div className="rounded-[2rem] border border-accent/30 bg-accent/5 p-8 text-center">
                <div className="flex justify-center text-accent/60 mb-3">
                  <CheckCircle size={36} strokeWidth={1.5} />
                </div>
                <p className="mt-1 text-sm font-bold text-primary">자유 이용 시설</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  예약 없이 운영 시간 내 자유롭게 이용하실 수 있습니다.
                </p>
                <p className="mt-2 text-xs font-semibold text-accent">
                  운영 시간: {selected.operatingHours}
                </p>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

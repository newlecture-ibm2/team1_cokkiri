"use client";

// #78: 주단위 타임테이블 Grid 마크업
// functional-specification §3.2.2: 가로=요일, 세로=시간대, 색상 구분
// ui-guideline: Moss & Aloe 시맨틱 클래스, framer-motion 마이크로 애니메이션

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchTimeSlots, createReservation } from "../_api";
import type { Facility } from "../_types";
import { ApiError } from "@/lib/api";

// ──────────────────────────────────────────
// 상수
// ──────────────────────────────────────────

const DAYS_KO = ["월", "화", "수", "목", "금", "토", "일"];
const SLOT_MINUTES = 30; // 30분 단위
const DAY_START = 6;     // 06:00
const DAY_END = 23;      // 23:00

interface SlotData {
  status: "AVAILABLE" | "MY_RESERVATION" | "OCCUPIED";
  reservationId?: number;
}

interface TimetableData {
  [date: string]: {
    [time: string]: SlotData; // "14:00"
  };
}

// ──────────────────────────────────────────
// 유틸
// ──────────────────────────────────────────

/** 해당 주의 월요일 ISO 날짜 반환 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=일
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Date → "YYYY-MM-DD" */
function toDateStr(date: Date): string {
  return date.toISOString().split("T")[0];
}

/** 분 → "HH:MM" */
function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const m = (totalMinutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** 슬롯 시작 시간 배열 생성 */
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let m = DAY_START * 60; m < DAY_END * 60; m += SLOT_MINUTES) {
    slots.push(minutesToTime(m));
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

/** API 응답 → TimetableData 변환 */
function parseSlots(
  apiData: Record<string, Array<{ startTime: string; endTime: string; status: string; reservationId?: number }>>
): TimetableData {
  const result: TimetableData = {};
  for (const [date, slots] of Object.entries(apiData)) {
    result[date] = {};
    for (const slot of slots) {
      const start = slot.startTime.slice(0, 5); // "14:00:00" → "14:00"
      result[date][start] = {
        status: slot.status as SlotData["status"],
        reservationId: slot.reservationId,
      };
    }
  }
  return result;
}

// ──────────────────────────────────────────
// 셀 컴포넌트
// ──────────────────────────────────────────

interface SlotCellProps {
  slotData?: SlotData;
  isSelected: boolean;
  isPast: boolean;
  onClick: () => void;
}

function SlotCell({ slotData, isSelected, isPast, onClick }: SlotCellProps) {
  const status = slotData?.status ?? "AVAILABLE";

  const baseClass = "h-8 w-full cursor-pointer rounded-lg border transition-all duration-150";

  const statusClass = isPast
    ? "border-transparent bg-muted/20 cursor-not-allowed opacity-40"
    : isSelected
    ? "border-primary bg-primary scale-[1.04] shadow-sm shadow-primary/30 cursor-pointer"
    : status === "MY_RESERVATION"
    ? "border-accent/60 bg-accent/20 cursor-not-allowed"
    : status === "OCCUPIED"
    ? "border-muted bg-muted/40 cursor-not-allowed opacity-70"
    : "border-border/50 bg-surface hover:border-primary/40 hover:bg-primary/10";

  return (
    <motion.div
      whileHover={!isPast && status === "AVAILABLE" ? { scale: 1.05 } : undefined}
      whileTap={!isPast && status === "AVAILABLE" ? { scale: 0.95 } : undefined}
      className={`${baseClass} ${statusClass}`}
      onClick={!isPast && (status === "AVAILABLE" || isSelected) ? onClick : undefined}
      title={
        isPast ? "지난 시간" :
        status === "MY_RESERVATION" ? "내 예약" :
        status === "OCCUPIED" ? "예약 불가" :
        isSelected ? "선택 취소" : "클릭하여 선택"
      }
    />
  );
}

// ──────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────

interface WeeklyTimetableProps {
  facility: Facility;
  onReserved?: () => void;
}

export function WeeklyTimetable({ facility, onReserved }: WeeklyTimetableProps) {
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [timetable, setTimetable] = useState<TimetableData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 선택: { date, startTime, endTime(=startTime+30분) }
  const [selectedSlots, setSelectedSlots] = useState<{ date: string; time: string }[]>([]);
  const [booking, setBooking] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // 이번 주 날짜 배열
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  // 타임슬롯 로드
  const loadSlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedSlots([]);
    try {
      const res = await fetchTimeSlots(facility.spaceId, toDateStr(weekStart));
      setTimetable(parseSlots(res.data ?? {}));
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError("예약 현황을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, [facility.spaceId, weekStart]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  // 피드백 자동 해제
  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  // 셀 클릭 — 연속 선택 지원 (같은 날, 연속 시간대)
  const handleCellClick = (date: string, time: string) => {
    setSelectedSlots((prev) => {
      const key = `${date}__${time}`;
      const alreadySelected = prev.some((s) => `${s.date}__${s.time}` === key);
      if (alreadySelected) {
        return prev.filter((s) => `${s.date}__${s.time}` !== key);
      }
      // 같은 날이어야만 추가 선택
      if (prev.length > 0 && prev[0].date !== date) {
        return [{ date, time }];
      }
      return [...prev, { date, time }].sort((a, b) => a.time.localeCompare(b.time));
    });
  };

  // 예약 신청
  const handleReserve = async () => {
    if (selectedSlots.length === 0) return;
    setBooking(true);
    try {
      const date = selectedSlots[0].date;
      const startTime = `${selectedSlots[0].time}:00`;
      const lastSlot = selectedSlots[selectedSlots.length - 1].time;
      // endTime = 마지막 슬롯 시작 + 30분
      const [h, m] = lastSlot.split(":").map(Number);
      const endMinutes = h * 60 + m + SLOT_MINUTES;
      const endTime = `${minutesToTime(endMinutes)}:00`;

      await createReservation({ spaceId: facility.spaceId, reservationDate: date, startTime, endTime });
      setFeedback({ type: "success", msg: "예약 신청이 완료되었습니다! 🎉" });
      setSelectedSlots([]);
      loadSlots();
      onReserved?.();
    } catch (e) {
      if (e instanceof ApiError) setFeedback({ type: "error", msg: e.message });
      else setFeedback({ type: "error", msg: "예약 신청에 실패했습니다." });
    } finally {
      setBooking(false);
    }
  };

  // 주 이동
  const shiftWeek = (delta: number) => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + delta * 7);
      return d;
    });
  };

  const today = toDateStr(new Date());
  const now = new Date();
  const nowTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes() >= 30 ? "30" : "00"}`;

  const selectedDate = selectedSlots[0]?.date;
  const selectedStart = selectedSlots[0]?.time;
  const selectedEnd = (() => {
    if (selectedSlots.length === 0) return null;
    const last = selectedSlots[selectedSlots.length - 1].time;
    const [h, m] = last.split(":").map(Number);
    return minutesToTime(h * 60 + m + SLOT_MINUTES);
  })();

  return (
    <div className="space-y-4">
      {/* 주 이동 헤더 */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3">
        <button
          onClick={() => shiftWeek(-1)}
          className="rounded-xl px-3 py-1.5 text-sm font-bold text-muted-foreground transition hover:bg-muted/40 hover:text-primary"
        >
          ← 이전 주
        </button>

        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
            {weekStart.getFullYear()}년
          </p>
          <p className="text-sm font-bold text-primary">
            {weekStart.getMonth() + 1}월 {weekStart.getDate()}일 –{" "}
            {weekDates[6].getMonth() + 1}월 {weekDates[6].getDate()}일
          </p>
        </div>

        <button
          onClick={() => shiftWeek(1)}
          className="rounded-xl px-3 py-1.5 text-sm font-bold text-muted-foreground transition hover:bg-muted/40 hover:text-primary"
        >
          다음 주 →
        </button>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-3 px-1 text-[10px] font-semibold text-muted-foreground">
        {[
          { color: "bg-primary", label: "선택됨" },
          { color: "bg-accent/30 border border-accent/60", label: "내 예약" },
          { color: "bg-muted/40 border border-muted", label: "예약 불가" },
          { color: "bg-surface border border-border/50", label: "예약 가능" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`h-3 w-6 rounded-sm ${color}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* 그리드 */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 animate-pulse rounded-xl bg-muted/30" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center">
          <p className="text-sm font-medium text-destructive">{error}</p>
          <button
            onClick={loadSlots}
            className="mt-3 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[2rem] border border-border bg-surface">
          <div
            className="grid min-w-[560px]"
            style={{ gridTemplateColumns: `56px repeat(7, 1fr)` }}
          >
            {/* 헤더 행 — 요일 */}
            <div className="sticky left-0 bg-surface" /> {/* 시간 컬럼 자리 */}
            {weekDates.map((date, i) => {
              const dateStr = toDateStr(date);
              const isToday = dateStr === today;
              return (
                <div
                  key={dateStr}
                  className={`border-b border-border px-1 py-2 text-center text-xs font-bold tracking-tight ${
                    isToday ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <p className={`text-[9px] font-black uppercase tracking-[0.15em] ${
                    isToday ? "text-accent" : "text-muted-foreground"
                  }`}>
                    {DAYS_KO[i]}
                  </p>
                  <p className={`text-sm font-bold ${isToday ? "text-primary" : ""}`}>
                    {date.getDate()}
                  </p>
                  {isToday && (
                    <div className="mx-auto mt-0.5 h-1 w-1 rounded-full bg-accent" />
                  )}
                </div>
              );
            })}

            {/* 시간 행 */}
            {TIME_SLOTS.map((time, tIdx) => {
              const isHourMark = time.endsWith(":00");
              return [
                // 시간 레이블 셀
                <div
                  key={`label-${time}`}
                  className={`sticky left-0 flex items-center justify-end border-b border-border/40 bg-surface pr-2 ${
                    isHourMark ? "text-[10px] font-semibold text-muted-foreground" : ""
                  }`}
                  style={{ minHeight: "2rem" }}
                >
                  {isHourMark ? time : ""}
                </div>,

                // 각 날짜 셀
                ...weekDates.map((date) => {
                  const dateStr = toDateStr(date);
                  const slotData = timetable[dateStr]?.[time];
                  const isPast =
                    dateStr < today || (dateStr === today && time < nowTime);
                  const isSelected = selectedSlots.some(
                    (s) => s.date === dateStr && s.time === time
                  );
                  return (
                    <div
                      key={`${dateStr}-${time}`}
                      className="border-b border-l border-border/30 p-0.5"
                    >
                      <SlotCell
                        slotData={slotData}
                        isSelected={isSelected}
                        isPast={isPast}
                        onClick={() => handleCellClick(dateStr, time)}
                      />
                    </div>
                  );
                }),
              ];
            })}
          </div>
        </div>
      )}

      {/* 선택 요약 + 예약 버튼 */}
      <AnimatePresence>
        {selectedSlots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="rounded-[2rem] border border-primary/30 bg-primary/5 p-5 space-y-3"
          >
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                예약 요약
              </p>
              <p className="text-sm font-bold text-primary">
                {selectedDate} &nbsp;{selectedStart} – {selectedEnd}
              </p>
              <p className="text-xs text-muted-foreground">
                {facility.name} · {selectedSlots.length * SLOT_MINUTES}분
              </p>
            </div>

            <button
              onClick={handleReserve}
              disabled={booking}
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground
                transition hover:opacity-90 disabled:opacity-50"
            >
              {booking ? "신청 중..." : "예약 신청"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 피드백 토스트 */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-xl border px-4 py-3 text-sm font-medium ${
              feedback.type === "success"
                ? "border-green-400/30 bg-green-50/80 text-green-800"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            {feedback.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

// #78: 주단위 타임테이블 Grid 마크업
// functional-specification §3.2.2: 가로=요일, 세로=시간대, 색상 구분
// ui-guideline: Moss & Aloe 시맨틱 클래스, framer-motion 마이크로 애니메이션

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { fetchTimeSlots, createReservation } from "../_api";
import type { Facility } from "../_types";
import { ApiError } from "@/lib/api";
import { ReservationRequestModal } from "./ReservationRequestModal";
import { ReservationBlockedModal } from "./ReservationBlockedModal";


// ──────────────────────────────────────────
// 상수
// ──────────────────────────────────────────

const DAYS_KO = ["월", "화", "수", "목", "금", "토", "일"];
const SLOT_MINUTES = 30; // 30분 단위
const DAY_START = 6;     // 06:00
const DAY_END = 23;      // 23:00
const MAX_RESERVATION_MINUTES = 120;
const MAX_SLOT_COUNT = MAX_RESERVATION_MINUTES / SLOT_MINUTES;

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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
// 미니 달력 팝업 컴포넌트
// ──────────────────────────────────────────

const CAL_DAYS = ["월", "화", "수", "목", "금", "토", "일"];

interface MiniCalendarProps {
  weekStart: Date;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}

function MiniCalendar({ weekStart, onSelectDate, onClose }: MiniCalendarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(weekStart.getFullYear());
  const [viewMonth, setViewMonth] = useState(weekStart.getMonth()); // 0-indexed

  // 외부 클릭 감지
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // 해당 월의 날짜 그리드 생성 (월요일 시작)
  const firstDay = new Date(viewYear, viewMonth, 1);
  // 월요일 기준 시작 오프셋 (0=월,1=화,...,6=일)
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ];
  // 7의 배수로 맞추기
  while (cells.length % 7 !== 0) cells.push(null);

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  // 현재 weekStart의 주 범위
  const wsStart = new Date(weekStart);
  wsStart.setHours(0, 0, 0, 0);
  const wsEnd = new Date(wsStart);
  wsEnd.setDate(wsEnd.getDate() + 6);

  const isInSelectedWeek = (d: Date) => d >= wsStart && d <= wsEnd;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 rounded-[1.5rem] border border-border bg-background shadow-xl shadow-primary/10"
    >
      {/* 월 이동 헤더 */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <button
          onClick={() => shiftMonth(-1)}
          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted/40 hover:text-primary"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="text-sm font-bold text-primary">
          {viewYear}년 {viewMonth + 1}월
        </p>
        <button
          onClick={() => shiftMonth(1)}
          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted/40 hover:text-primary"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* 요일 행 */}
      <div className="grid grid-cols-7 border-b border-border/50 px-3 pt-2 pb-1">
        {CAL_DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-0.5 p-3">
        {cells.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} />;
          const isToday = date.getTime() === today.getTime();
          const inSelectedWeek = isInSelectedWeek(date);
          return (
            <button
              key={date.toISOString()}
              onClick={() => { onSelectDate(date); onClose(); }}
              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all
                ${
                  inSelectedWeek
                    ? "bg-primary text-primary-foreground"
                    : isToday
                    ? "border border-accent text-accent"
                    : "text-primary hover:bg-muted/50"
                }
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* 오늘로 이동 버튼 */}
      <div className="border-t border-border/50 px-4 py-2.5">
        <button
          onClick={() => { onSelectDate(new Date()); onClose(); }}
          className="w-full rounded-xl py-1.5 text-xs font-bold text-accent transition hover:bg-accent/10"
        >
          오늘로 이동
        </button>
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────
// 셀 컴포넌트
// ──────────────────────────────────────────

interface SlotCellProps {
  slotData?: SlotData;
  isSelected: boolean;
  isPast: boolean;
  onPointerDown: () => void;
  onPointerEnter: () => void;
}

function SlotCell({ slotData, isSelected, isPast, onPointerDown, onPointerEnter }: SlotCellProps) {
  const status = slotData?.status ?? "AVAILABLE";

  const baseClass = "h-8 w-full cursor-pointer rounded-lg border transition-all duration-150";

  const statusClass = isPast
    ? "border-transparent bg-muted/20 cursor-not-allowed opacity-40"
    : isSelected
    ? "border-primary bg-primary scale-[1.04] shadow-sm shadow-primary/30 cursor-pointer"
    : status === "MY_RESERVATION"
    ? "border-accent/60 bg-accent/20 cursor-not-allowed"
    : status === "OCCUPIED"
    ? "border-red-400/70 bg-red-500/20 cursor-not-allowed"
    : "border-border/50 bg-surface hover:border-primary/40 hover:bg-primary/10";

  return (
    <motion.div
      whileHover={!isPast && status === "AVAILABLE" ? { scale: 1.05 } : undefined}
      whileTap={!isPast && status === "AVAILABLE" ? { scale: 0.95 } : undefined}
      className={`${baseClass} ${statusClass}`}
      onPointerDown={!isPast && status === "AVAILABLE" ? onPointerDown : undefined}
      onPointerEnter={!isPast ? onPointerEnter : undefined}
      title={
        isPast ? "지난 시간" :
        status === "MY_RESERVATION" ? "내 예약" :
        status === "OCCUPIED" ? "이미 예약된 시간" :
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

function getUtcOffsetString(date: Date): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hours = String(Math.floor(abs / 60)).padStart(2, "0");
  const minutes = String(abs % 60).padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

function buildLocalIso(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes, seconds = 0] = timeStr.split(":").map(Number);
  const localDate = new Date(year, month - 1, day, hours, minutes, seconds, 0);
  return `${dateStr}T${timeStr}${getUtcOffsetString(localDate)}`;
}

function getTimeValue(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function isSelectableSlot(slotData?: SlotData, isPast?: boolean) {
  return !isPast && (slotData?.status ?? "AVAILABLE") === "AVAILABLE";
}

export function WeeklyTimetable({ facility, onReserved }: WeeklyTimetableProps) {
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [timetable, setTimetable] = useState<TimetableData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // 선택: { date, startTime, endTime(=startTime+30분) }
  const [selectedSlots, setSelectedSlots] = useState<{ date: string; time: string }[]>([]);
  const [booking, setBooking] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [blockedReservationMessage, setBlockedReservationMessage] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{ active: boolean; anchorDate: string | null; anchorTime: string | null }>({
    active: false,
    anchorDate: null,
    anchorTime: null,
  });

  // 이번 주 날짜 배열
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const today = toDateStr(new Date());
  const now = new Date();
  const nowTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes() >= 30 ? "30" : "00"}`;

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

  useEffect(() => {
    const handlePointerUp = () => {
      setDragState((prev) => (prev.active ? { active: false, anchorDate: null, anchorTime: null } : prev));
    };

    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, []);

  const updateDraggedSelection = useCallback((date: string, targetTime: string) => {
    setDragState((currentDrag) => {
      if (!currentDrag.active || currentDrag.anchorDate !== date || !currentDrag.anchorTime) {
        return currentDrag;
      }

      const startValue = Math.min(getTimeValue(currentDrag.anchorTime), getTimeValue(targetTime));
      const endValue = Math.max(getTimeValue(currentDrag.anchorTime), getTimeValue(targetTime));
      const direction = getTimeValue(targetTime) >= getTimeValue(currentDrag.anchorTime) ? 1 : -1;
      const nextSelection: { date: string; time: string }[] = [];
      let exceededMaxDuration = false;

      for (const time of TIME_SLOTS) {
        const timeValue = getTimeValue(time);
        if (timeValue < startValue || timeValue > endValue) continue;

        const slotData = timetable[date]?.[time];
        const isPastSlot = date < today || (date === today && time < nowTime);

        if (!isSelectableSlot(slotData, isPastSlot)) {
          setFeedback({
            type: "error",
            msg: "예약 불가 영역은 드래그해서 선택할 수 없습니다.",
          });
          return currentDrag;
        }

        nextSelection.push({ date, time });
      }

      const anchorIndex = TIME_SLOTS.indexOf(currentDrag.anchorTime);
      const targetIndex = TIME_SLOTS.indexOf(targetTime);
      const requestedSlotCount = Math.abs(targetIndex - anchorIndex) + 1;

      if (requestedSlotCount > MAX_SLOT_COUNT) {
        exceededMaxDuration = true;
        const limitedSelection: { date: string; time: string }[] = [];
        for (let step = 0; step < MAX_SLOT_COUNT; step += 1) {
          const slotIndex = anchorIndex + step * direction;
          const time = TIME_SLOTS[slotIndex];
          if (!time) break;

          const slotData = timetable[date]?.[time];
          const isPastSlot = date < today || (date === today && time < nowTime);

          if (!isSelectableSlot(slotData, isPastSlot)) {
            setFeedback({
              type: "error",
              msg: "예약 불가 영역은 드래그해서 선택할 수 없습니다.",
            });
            return currentDrag;
          }

          limitedSelection.push({ date, time });
        }
        setSelectedSlots(direction === -1 ? limitedSelection.reverse() : limitedSelection);
      } else {
        setSelectedSlots(nextSelection);
      }

      if (exceededMaxDuration) {
        setFeedback({
          type: "error",
          msg: "최대 2시간까지만 선택할 수 있습니다.",
        });
      }

      return currentDrag;
    });
  }, [nowTime, timetable, today]);

  const handleSelectionStart = (date: string, time: string, slotData?: SlotData, isPast?: boolean) => {
    if (!isSelectableSlot(slotData, isPast)) {
      setFeedback({ type: "error", msg: "선택할 수 없는 슬롯입니다." });
      return;
    }

    setSelectedSlots([{ date, time }]);
    setDragState({ active: true, anchorDate: date, anchorTime: time });
  };

  const handleSelectionEnter = (date: string, time: string) => {
    if (!dragState.active) return;
    updateDraggedSelection(date, time);
  };

  const selectedDate = selectedSlots[0]?.date;
  const selectedStart = selectedSlots[0]?.time;
  const selectedEnd = (() => {
    if (selectedSlots.length === 0) return;
    const last = selectedSlots[selectedSlots.length - 1].time;
    const [h, m] = last.split(":").map(Number);
    return minutesToTime(h * 60 + m + SLOT_MINUTES);
  })();

  const reservationWindow = selectedDate && selectedStart && selectedEnd
    ? {
        date: selectedDate,
        startTime: `${selectedStart}:00`,
        endTime: `${selectedEnd}:00`,
        startIso: buildLocalIso(selectedDate, `${selectedStart}:00`),
        endIso: buildLocalIso(selectedDate, `${selectedEnd}:00`),
      }
    : null;

  const handleReserve = async (_form: { purpose: string; notes: string }) => {
    if (!reservationWindow) return;
    setBooking(true);
    try {
      await createReservation({
        spaceId: facility.spaceId,
        reservationDate: reservationWindow.date,
        startTime: reservationWindow.startTime,
        endTime: reservationWindow.endTime,
      });
      setFeedback({ type: "success", msg: "예약 신청이 완료되었습니다! 🎉" });
      setSelectedSlots([]);
      setIsReservationModalOpen(false);
      loadSlots();
      onReserved?.();
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.message.includes("입주 기간 종료로 인해 예약이 불가능합니다")) {
          setIsReservationModalOpen(false);
          setBlockedReservationMessage("계약 종료 이후에는 공용시설 예약이 불가능합니다. 계약 기간을 확인해주세요.");
        } else {
          setFeedback({ type: "error", msg: e.message });
        }
      } else {
        setFeedback({ type: "error", msg: "예약 신청에 실패했습니다." });
      }
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

  const handleDateSelect = (date: Date) => {
    setWeekStart(getWeekStart(date));
  };

  return (
    <div className="space-y-4">
      {/* 주 이동 헤더 */}
      <div className="relative flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3">
        <button
          onClick={() => shiftWeek(-1)}
          className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-bold text-muted-foreground transition hover:bg-muted/40 hover:text-primary"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">이전 주</span>
        </button>

        {/* 날짜 범위 클릭 → 달력 팝업 */}
        <button
          onClick={() => setCalendarOpen((v) => !v)}
          className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-center transition hover:bg-muted/30"
        >
          <CalendarDays size={15} className="text-accent" />
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {weekStart.getFullYear()}년
            </p>
            <p className="text-sm font-bold text-primary">
              {weekStart.getMonth() + 1}월 {weekStart.getDate()}일 –{" "}
              {weekDates[6].getMonth() + 1}월 {weekDates[6].getDate()}일
            </p>
          </div>
        </button>

        <button
          onClick={() => shiftWeek(1)}
          className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-bold text-muted-foreground transition hover:bg-muted/40 hover:text-primary"
        >
          <span className="hidden sm:inline">다음 주</span>
          <ChevronRight size={16} />
        </button>

        {/* 달력 팝업 */}
        <AnimatePresence>
          {calendarOpen && (
            <MiniCalendar
              weekStart={weekStart}
              onSelectDate={handleDateSelect}
              onClose={() => setCalendarOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-3 px-1 text-[10px] font-semibold text-muted-foreground">
        {[
          { color: "bg-primary", label: "선택됨" },
          { color: "bg-accent/30 border border-accent/60", label: "내 예약" },
          { color: "bg-red-500/20 border border-red-400/70", label: "이미 예약됨" },
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
                        onPointerDown={() => handleSelectionStart(dateStr, time, slotData, isPast)}
                        onPointerEnter={() => handleSelectionEnter(dateStr, time)}
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
                {facility.name} · {selectedSlots.length * SLOT_MINUTES}분 / 최대 {MAX_RESERVATION_MINUTES}분
              </p>
              {reservationWindow ? (
                <p className="text-[11px] font-medium text-muted-foreground/80">
                  {reservationWindow.startIso} → {reservationWindow.endIso}
                </p>
              ) : null}
            </div>

            <button
              onClick={() => setIsReservationModalOpen(true)}
              disabled={booking}
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground
                transition hover:opacity-90 disabled:opacity-50"
            >
              신청 정보 입력
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

      {reservationWindow ? (
        <ReservationRequestModal
          isOpen={isReservationModalOpen}
          facilityName={facility.name}
          startLabel={`${reservationWindow.date} ${selectedStart}`}
          endLabel={`${reservationWindow.date} ${selectedEnd}`}
          durationMinutes={selectedSlots.length * SLOT_MINUTES}
          startIso={reservationWindow.startIso}
          endIso={reservationWindow.endIso}
          onClose={() => setIsReservationModalOpen(false)}
          onSubmit={handleReserve}
          isSubmitting={booking}
        />
      ) : null}

      <ReservationBlockedModal
        isOpen={blockedReservationMessage !== null}
        message={blockedReservationMessage ?? ""}
        onClose={() => setBlockedReservationMessage(null)}
      />
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Filter, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "createdAt,desc", label: "최신순" },
  { value: "createdAt,asc", label: "오래된순" },
] as const;

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

function parseDateInput(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMonthLabel(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function buildCalendarCells(viewMonth: Date): Array<{ date: Date; inCurrentMonth: boolean }> {
  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return {
      date,
      inCurrentMonth: date.getMonth() === viewMonth.getMonth(),
    };
  });
}

export function AdminVocSearchAndSort() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const currentSort = searchParams.get("sort") ?? "createdAt,desc";

  useEffect(() => {
    setSearchQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const buildUrl = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("p"); // Reset page
      for (const [key, val] of Object.entries(overrides)) {
        if (val === null || val === "") {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      }
      return `/admin/vocs?${params.toString()}`;
    },
    [searchParams],
  );

  const handleSearch = () => {
    router.push(buildUrl({ q: searchQuery || null }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearchOpen(false);
    router.push(buildUrl({ q: null }));
  };

  const handleSort = (sortValue: string) => {
    setIsSortOpen(false);
    router.push(buildUrl({ sort: sortValue }));
  };

  return (
    <div className="relative flex flex-wrap items-center justify-end gap-3 self-end md:self-auto">
      <AnimatePresence mode="wait">
        {isSearchOpen ? (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-1.5 border-b border-foreground pb-2"
          >
            <input
              autoFocus
              placeholder="민원 검색..."
              className="bg-transparent text-xs md:text-sm font-bold uppercase tracking-wider focus:outline-none min-w-[120px] md:min-w-[160px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleClearSearch} className="cursor-pointer">
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ) : (
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 text-xs md:text-sm font-bold uppercase tracking-wider hover:opacity-60 transition-opacity cursor-pointer pb-2"
          >
            <Search className="h-3.5 w-3.5" />
            SEARCH
          </button>
        )}
      </AnimatePresence>

      <div className="relative">
        <button
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="flex items-center gap-1.5 text-xs md:text-sm font-bold uppercase tracking-wider hover:opacity-60 transition-opacity cursor-pointer pb-2"
        >
          <Filter className="h-3.5 w-3.5" />
          SORT
        </button>

        <AnimatePresence>
          {isSortOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsSortOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
                className="absolute right-0 top-full z-20 mt-3 flex flex-col gap-1.5 rounded-3xl border-2 border-stone-200/70 bg-stone-50/98 p-3 shadow-md backdrop-blur-md min-w-[140px]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSort(opt.value)}
                    className={`rounded-md px-4 py-2.5 text-center text-xs font-black uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                      currentSort === opt.value
                        ? "bg-primary/10 text-primary"
                        : "text-primary/70 hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function AdminVocDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [createdFrom, setCreatedFrom] = useState(searchParams.get("createdFrom") ?? "");
  const [createdTo, setCreatedTo] = useState(searchParams.get("createdTo") ?? "");
  const [openDatePicker, setOpenDatePicker] = useState<"from" | "to" | null>(null);
  const [viewMonth, setViewMonth] = useState(new Date());

  const fromDate = parseDateInput(createdFrom);
  const toDate = parseDateInput(createdTo);
  const calendarCells = buildCalendarCells(viewMonth);

  useEffect(() => {
    setCreatedFrom(searchParams.get("createdFrom") ?? "");
    setCreatedTo(searchParams.get("createdTo") ?? "");
  }, [searchParams]);

  const buildUrl = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("p"); // Reset page
      for (const [key, val] of Object.entries(overrides)) {
        if (val === null || val === "") {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      }
      return `/admin/vocs?${params.toString()}`;
    },
    [searchParams],
  );

  const applyDateFilters = useCallback(
    (nextFrom: string, nextTo: string) => {
      router.push(
        buildUrl({
          createdFrom: nextFrom || null,
          createdTo: nextTo || null,
        }),
      );
    },
    [buildUrl, router],
  );

  function openPicker(target: "from" | "to") {
    const current = target === "from" ? fromDate : toDate;
    setViewMonth(current ?? new Date());
    setOpenDatePicker(target);
  }

  function moveMonth(offset: number) {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  }

  function isSameDay(a: Date | null, b: Date): boolean {
    return !!a && a.toDateString() === b.toDateString();
  }

  function isDisabledDay(target: "from" | "to", date: Date): boolean {
    if (target === "from" && toDate) return date > toDate;
    if (target === "to" && fromDate) return date < fromDate;
    return false;
  }

  function applyDate(target: "from" | "to", date: Date) {
    const value = toDateInputValue(date);
    if (target === "from") {
      setCreatedFrom(value);
      applyDateFilters(value, createdTo);
    } else {
      setCreatedTo(value);
      applyDateFilters(createdFrom, value);
    }
    setOpenDatePicker(null);
  }

  return (
    <div className="relative flex items-center gap-2 pb-1.5">
      <span className="mr-1 text-center text-sm md:text-base font-bold uppercase tracking-wider text-primary">날짜별</span>
      <span className="text-primary/10 select-none mr-1">|</span>
      <button
        type="button"
        onClick={() => openPicker("from")}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-center text-sm font-semibold text-foreground/80 shadow-sm transition-colors hover:border-primary/40"
      >
        <CalendarDays className="h-4 w-4 text-stone-400" />
        {createdFrom || "시작일"}
      </button>
      <span className="text-foreground/30 text-sm md:text-base">~</span>
      <button
        type="button"
        onClick={() => openPicker("to")}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-center text-sm font-semibold text-foreground/80 shadow-sm transition-colors hover:border-primary/40"
      >
        <CalendarDays className="h-4 w-4 text-stone-400" />
        {createdTo || "종료일"}
      </button>

      <AnimatePresence>
        {openDatePicker && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10 cursor-default bg-transparent"
              onClick={() => setOpenDatePicker(null)}
              aria-label="달력 닫기"
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 top-full z-20 mt-3 w-[300px] rounded-3xl border border-stone-200 bg-white p-4 shadow-xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => moveMonth(-1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition-colors hover:bg-stone-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <p className="text-sm font-bold text-stone-800">{getMonthLabel(viewMonth)}</p>
                <button
                  type="button"
                  onClick={() => moveMonth(1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition-colors hover:bg-stone-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-stone-400">
                {WEEKDAY_LABELS.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map(({ date, inCurrentMonth }) => {
                  const selected =
                    openDatePicker === "from" ? isSameDay(fromDate, date) : isSameDay(toDate, date);
                  const disabled = isDisabledDay(openDatePicker, date);
                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      disabled={disabled}
                      onClick={() => applyDate(openDatePicker, date)}
                      className={cn(
                        "h-9 rounded-xl text-sm font-semibold transition-colors",
                        !inCurrentMonth && "text-stone-300",
                        inCurrentMonth && !selected && "text-stone-700 hover:bg-stone-100",
                        selected && "bg-primary text-white hover:bg-primary",
                        disabled && "cursor-not-allowed text-stone-200 hover:bg-transparent",
                      )}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

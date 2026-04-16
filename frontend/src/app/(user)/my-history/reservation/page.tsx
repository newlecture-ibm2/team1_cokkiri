"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CalendarClock, ChevronRight, Loader2, SearchX } from "lucide-react";
import { cancelReservation, fetchMyReservations } from "./_api";
import { ReservationHistoryCard } from "./_components/ReservationHistoryCard";
import { ReservationStatusBadge } from "./_components/ReservationStatusBadge";
import type { MyReservationItem } from "./_types";

const statusOrder: MyReservationItem["status"][] = [
  "PENDING",
  "APPROVED",
  "COMPLETED",
  "CANCELLED",
];

export default function ReservationHistoryPage() {
  const [reservations, setReservations] = useState<MyReservationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingReservationId, setCancellingReservationId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<MyReservationItem["status"] | "ALL">("ALL");

  useEffect(() => {
    const loadReservations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchMyReservations();
        setReservations(response.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "예약 내역을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadReservations();
  }, []);

  const statusCounts = useMemo(() => {
    return statusOrder.map((status) => ({
      status,
      count: reservations.filter((reservation) => reservation.status === status).length,
    }));
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    if (activeStatusFilter === "ALL") {
      return reservations;
    }

    return reservations.filter((reservation) => reservation.status === activeStatusFilter);
  }, [activeStatusFilter, reservations]);

  const handleCancelReservation = async (reservationId: number) => {
    setCancellingReservationId(reservationId);
    setActionMessage(null);
    try {
      await cancelReservation(reservationId);
      setReservations((current) =>
        current.map((reservation) =>
          reservation.id === reservationId
            ? { ...reservation, status: "CANCELLED" }
            : reservation,
        ),
      );
      setActionMessage({ type: "success", text: "예약이 취소되었습니다." });
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "예약 취소에 실패했습니다.",
      });
    } finally {
      setCancellingReservationId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mx-auto max-w-5xl text-primary"
    >
      {/* Editorial Header */}
      <header className="mb-[clamp(2rem,5vw,4rem)]">
        <div className="flex flex-col gap-[clamp(0.75rem,1.5vw,1.5rem)]">
          <div className="flex items-end justify-between gap-4 border-b border-primary/10 pb-[clamp(1rem,2vw,2rem)]">
            <div className="min-w-0">
              <h1 className="text-[clamp(2.25rem,7vw,5.5rem)] font-black leading-none tracking-tight uppercase whitespace-nowrap text-primary">
                RESERVATIO<span className="underline underline-offset-4 decoration-[var(--color-accent)]">NS.</span>
                <span className="text-[clamp(1rem,3vw,2.5rem)] font-bold tracking-normal ml-3 align-baseline opacity-80">예약 이력</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <section className="pb-10 md:pb-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="rounded-[2rem] border border-primary/10 bg-primary/5 p-6 md:min-w-[280px]">
            <p className="text-[10px] font-black tracking-[0.28em] text-primary/45 uppercase">
              Total Reservations
            </p>
            <p className="mt-3 text-[clamp(2rem,5vw,3rem)] font-black tracking-tighter">
              {String(reservations.length).padStart(2, "0")}
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-muted">
              <ChevronRight className="h-4 w-4 text-accent" />
              최신 예약부터 순서대로 표시됩니다
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 py-10 md:grid-cols-2 xl:grid-cols-4">
        {statusCounts.map(({ status, count }, index) => (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className={`rounded-[2rem] border p-5 transition ${
              activeStatusFilter === status
                ? "border-primary bg-primary/10 shadow-sm shadow-primary/10"
                : "border-primary/10 bg-background/70"
            }`}
          >
            <button
              type="button"
              onClick={() =>
                setActiveStatusFilter((current) => (current === status ? "ALL" : status))
              }
              className="w-full text-left"
            >
              <ReservationStatusBadge status={status} />
              <p className="mt-5 text-4xl font-black tracking-tighter text-primary">
                {String(count).padStart(2, "0")}
              </p>
              <p className="mt-2 text-sm font-medium tracking-tight text-muted">
                클릭하면 해당 상태 예약만 필터링됩니다.
              </p>
            </button>
          </motion.div>
        ))}
      </section>

      <section className="space-y-6">
        {!isLoading && !error ? (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveStatusFilter("ALL")}
              className={`rounded-full border px-4 py-2 text-[11px] font-black tracking-[0.2em] uppercase transition ${
                activeStatusFilter === "ALL"
                  ? "border-primary bg-primary text-background"
                  : "border-primary/15 bg-background text-primary"
              }`}
            >
              전체 보기
            </button>
            {activeStatusFilter !== "ALL" ? (
              <p className="text-sm font-semibold tracking-tight text-muted">
                현재 <span className="text-primary">{activeStatusFilter}</span> 상태 예약만 보고 있습니다.
              </p>
            ) : null}
          </div>
        ) : null}

        {actionMessage ? (
          <div
            className={`rounded-2xl border px-5 py-4 text-sm font-semibold ${
              actionMessage.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {actionMessage.text}
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-[2rem] border border-primary/10 bg-primary/5 p-10 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <p className="text-[10px] font-black tracking-[0.26em] text-primary/45 uppercase">
              Loading reservation timeline
            </p>
          </div>
        ) : error ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-[2rem] border border-red-200 bg-red-50/70 p-10 text-center">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <h2 className="text-2xl font-black tracking-tighter text-primary">
              예약 내역을 불러오지 못했습니다
            </h2>
            <p className="max-w-md text-sm font-medium tracking-tight text-muted">
              {error}
            </p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-[2rem] border border-primary/10 bg-primary/5 p-10 text-center">
            <SearchX className="h-10 w-10 text-accent" />
            <h2 className="text-2xl font-black tracking-tighter text-primary">
              {activeStatusFilter === "ALL" ? "아직 예약 내역이 없습니다" : "선택한 상태의 예약이 없습니다"}
            </h2>
            <p className="max-w-md text-sm font-medium tracking-tight text-muted">
              {activeStatusFilter === "ALL"
                ? "새로운 예약을 신청하면 이 화면에서 일정과 상태를 바로 확인할 수 있습니다."
                : "다른 상태 카드를 누르거나 전체 보기로 돌아가서 다른 예약을 확인해보세요."}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <CalendarClock className="h-5 w-5 text-accent" />
              <p className="text-[10px] font-black tracking-[0.26em] text-primary/45 uppercase">
                Reservation Timeline
              </p>
            </div>
            {filteredReservations.map((reservation, index) => (
              <ReservationHistoryCard
                key={reservation.id}
                reservation={reservation}
                index={index}
                onCancel={handleCancelReservation}
                isCancelling={cancellingReservationId === reservation.id}
              />
            ))}
          </>
        )}
      </section>
    </motion.div>
  );
}

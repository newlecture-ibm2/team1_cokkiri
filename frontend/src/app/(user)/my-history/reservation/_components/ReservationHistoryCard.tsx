"use client";

import { motion } from "framer-motion";
import { CalendarRange, Clock3, MapPin } from "lucide-react";
import { ReservationStatusBadge } from "./ReservationStatusBadge";
import type { MyReservationItem } from "../_types";

function formatReservationDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(parsed);
}

function formatTimeRange(startTime: string, endTime: string) {
  return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
}

function buildLocalIso(date: string, time: string) {
  return `${date}T${time.length === 5 ? `${time}:00` : time}`;
}

export function ReservationHistoryCard({
  reservation,
  index,
  onCancel,
  isCancelling = false,
}: {
  reservation: MyReservationItem;
  index: number;
  onCancel?: (reservationId: number) => void;
  isCancelling?: boolean;
}) {
  const canCancel = reservation.status === "PENDING" || reservation.status === "APPROVED";

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: index * 0.04 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="rounded-[2rem] border border-primary/10 bg-primary/5 p-6 md:p-8"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-[10px] font-black tracking-[0.32em] text-accent uppercase">
              Reservation #{String(reservation.id).padStart(4, "0")}
            </p>
            <h2 className="text-2xl font-black tracking-tighter text-primary md:text-3xl">
              {reservation.spaceName}
            </h2>
          </div>

          <div className="grid gap-3 text-sm text-muted md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-primary/8 bg-background/60 p-4">
              <CalendarRange className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div>
                <p className="text-[10px] font-black tracking-[0.28em] uppercase text-primary/45">
                  예약 일시
                </p>
                <p className="mt-1 font-semibold text-primary">
                  {formatReservationDate(reservation.reservationDate)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-primary/8 bg-background/60 p-4">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div>
                <p className="text-[10px] font-black tracking-[0.28em] uppercase text-primary/45">
                  이용 시간
                </p>
                <p className="mt-1 font-semibold text-primary">
                  {formatTimeRange(reservation.startTime, reservation.endTime)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-primary/8 bg-background/60 p-4 md:col-span-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div className="min-w-0">
                <p className="text-[10px] font-black tracking-[0.28em] uppercase text-primary/45">
                  로컬 ISO
                </p>
                <p className="mt-1 break-all font-mono text-xs text-primary/70">
                  {buildLocalIso(reservation.reservationDate, reservation.startTime)}
                </p>
                <p className="mt-1 break-all font-mono text-xs text-primary/70">
                  {buildLocalIso(reservation.reservationDate, reservation.endTime)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
          <ReservationStatusBadge status={reservation.status} />
          <p className="text-[10px] font-black tracking-[0.28em] text-primary/40 uppercase">
            Space ID {reservation.spaceId}
          </p>
          {canCancel ? (
            <button
              type="button"
              onClick={() => onCancel?.(reservation.id)}
              disabled={isCancelling}
              className="rounded-full border border-primary/15 bg-background px-4 py-2 text-[11px] font-black tracking-[0.2em] text-primary uppercase transition hover:bg-primary hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCancelling ? "취소 중" : "예약 취소"}
            </button>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

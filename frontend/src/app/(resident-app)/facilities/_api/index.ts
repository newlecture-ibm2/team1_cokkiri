// #78: 시설 예약 API 클라이언트
// 02-frontend-architecture §3: 브라우저는 /api/... 만 호출

import { apiFetch } from "@/lib/api";
import type { Facility, MyReservation, ReservationRequest } from "../_types";

/** 공용시설 목록 조회 (🔓 Public — api-specification §6.1) */
export async function fetchFacilities() {
  return apiFetch<Facility[]>("/facilities");
}

/**
 * 주단위 예약 타임슬롯 조회 (api-specification §6.2)
 * @param spaceId 시설 ID
 * @param weekStart ISO date string (e.g. "2026-05-01") — 해당 주의 월요일
 */
export async function fetchTimeSlots(spaceId: number, weekStart: string) {
  return apiFetch<{ [date: string]: Array<{ startTime: string; endTime: string; status: string; reservationId?: number }> }>(
    `/facilities/${spaceId}/slots?week_start=${weekStart}`
  );
}

/** 예약 신청 (POST /api/reservations — api-specification §6.3) */
export async function createReservation(data: ReservationRequest) {
  return apiFetch<{ reservationId: number }>("/reservations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** 내 예약 목록 조회 (GET /api/reservations/my — api-specification §6.4) */
export async function fetchMyReservations() {
  return apiFetch<MyReservation[]>("/reservations/my");
}

/** 예약 취소 (POST /api/reservations/{id}/cancel — api-specification §6.5) */
export async function cancelReservation(reservationId: number) {
  return apiFetch<void>(`/reservations/${reservationId}/cancel`, {
    method: "POST",
  });
}

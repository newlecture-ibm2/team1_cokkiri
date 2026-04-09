import { apiFetch } from "@/lib/api";
import type { MyReservationItem } from "../_types";

export async function fetchMyReservations() {
  return apiFetch<MyReservationItem[]>("/reservations/my");
}

export async function cancelReservation(reservationId: number) {
  return apiFetch<void>(`/reservations/${reservationId}/cancel`, {
    method: "POST",
  });
}

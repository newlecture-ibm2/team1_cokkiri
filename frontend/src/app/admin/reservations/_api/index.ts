import { apiFetch } from '@/lib/api';
import type { AdminReservationListParams, AdminReservationPage } from '../_types';

export async function fetchAdminReservations(params?: AdminReservationListParams) {
  const query = new URLSearchParams();

  if (params?.status) {
    query.set('status', params.status);
  }

  query.set('p', String(params?.p ?? 0));
  query.set('s', String(params?.s ?? 10));

  return apiFetch<AdminReservationPage>(`/admin/reservations?${query.toString()}`);
}

export async function approveReservation(reservationId: number) {
  return apiFetch<void>(`/admin/reservations/${reservationId}/approve`, {
    method: 'POST',
  });
}

export async function cancelReservationByAdmin(reservationId: number) {
  return apiFetch<void>(`/admin/reservations/${reservationId}/cancel`, {
    method: 'POST',
  });
}

export type AdminReservationStatus = 'PENDING' | 'APPROVED' | 'CANCELLED' | 'COMPLETED';

export interface AdminReservationItem {
  id: number;
  userId: number;
  userName: string;
  spaceId: number;
  spaceName: string;
  status: AdminReservationStatus;
  reservationDate: string;
  startTime: string;
  endTime: string;
  approvedBy: number | null;
}

export interface AdminReservationPage {
  content: AdminReservationItem[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AdminReservationListParams {
  status?: AdminReservationStatus;
  p?: number;
  s?: number;
}

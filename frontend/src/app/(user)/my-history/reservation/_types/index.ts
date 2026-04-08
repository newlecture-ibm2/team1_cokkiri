export interface MyReservationItem {
  id: number;
  spaceId: number;
  spaceName: string;
  status: "PENDING" | "APPROVED" | "CANCELLED" | "COMPLETED";
  reservationDate: string;
  startTime: string;
  endTime: string;
}

// #78: 공용시설 예약 타입 정의
// api-specification.md §6.1, §6.2, §6.3, §6.4

export interface Facility {
  spaceId: number;
  name: string;
  maxCapacity: number;
  operatingHours: string; // "06:00-23:00"
  isReservable: boolean;
  usageFee: number;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
}

export interface TimeSlot {
  date: string;        // "2026-05-01"
  startTime: string;   // "14:00:00"
  endTime: string;     // "16:00:00"
  status: "AVAILABLE" | "MY_RESERVATION" | "OCCUPIED";
  reservationId?: number;
}

export interface WeekSlots {
  [date: string]: TimeSlot[];
}

export interface ReservationRequest {
  spaceId: number;
  reservationDate: string;   // "2026-05-01"
  startTime: string;         // "14:00:00"
  endTime: string;           // "16:00:00"
}

export interface MyReservation {
  id: number;
  spaceId: number;
  spaceName: string;
  status: "PENDING" | "APPROVED" | "CANCELLED" | "COMPLETED";
  reservationDate: string;
  startTime: string;
  endTime: string;
}

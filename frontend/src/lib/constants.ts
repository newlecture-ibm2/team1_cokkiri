// src/lib/constants.ts

/** 사용자 역할 */
export type UserRole = 'ADMIN' | 'RESIDENT' | 'USER';

export const USER_ROLES = {
  ADMIN: 'ADMIN' as const,
  RESIDENT: 'RESIDENT' as const,
  USER: 'USER' as const,
};

/** 기기 타입 */
export type DeviceType =
  | 'LIGHT'
  | 'THERMOSTAT'
  | 'CURTAIN'
  | 'DOOR_LOCK'
  | 'CCTV'
  | 'AIR_CONDITIONER'
  | 'VENTILATION';

export const DEVICE_TYPES: Record<DeviceType, string> = {
  LIGHT: '조명',
  THERMOSTAT: '온도조절기',
  CURTAIN: '커튼',
  DOOR_LOCK: '도어락',
  CCTV: 'CCTV',
  AIR_CONDITIONER: '에어컨',
  VENTILATION: '환기장치',
};

/** 기기 상태 */
export type DeviceStatus = 'ACTIVE' | 'INACTIVE' | 'OFFLINE';

export const DEVICE_STATUS: Record<DeviceStatus, string> = {
  ACTIVE: '활성',
  INACTIVE: '비활성',
  OFFLINE: '오프라인',
};

/** 계약 상태 */
export type ContractStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'TERMINATED';

export const CONTRACT_STATUS: Record<ContractStatus, string> = {
  PENDING: '심사 중',
  APPROVED: '승인',
  REJECTED: '거절',
  ACTIVE: '활성',
  EXPIRED: '만료',
  TERMINATED: '해지',
};

/** 예약 상태 */
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export const RESERVATION_STATUS: Record<ReservationStatus, string> = {
  PENDING: '대기',
  CONFIRMED: '확정',
  CANCELLED: '취소',
  COMPLETED: '완료',
};

/** 결제 상태 */
export type PaymentStatus = 'UNPAID' | 'PAID' | 'OVERDUE';

export const PAYMENT_STATUS: Record<PaymentStatus, string> = {
  UNPAID: '미납',
  PAID: '완납',
  OVERDUE: '연체',
};

/** 민원(VOC) 상태 */
export type VocStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export const VOC_STATUS: Record<VocStatus, string> = {
  OPEN: '접수',
  IN_PROGRESS: '처리 중',
  RESOLVED: '해결',
  CLOSED: '종료',
};

/** 공간 타입 */
export type SpaceType = 'PRIVATE_ROOM' | 'SHARED_FACILITY';

export const SPACE_TYPES: Record<SpaceType, string> = {
  PRIVATE_ROOM: '개인실',
  SHARED_FACILITY: '공용시설',
};

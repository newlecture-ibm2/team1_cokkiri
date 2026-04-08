/** 도면 위 방 블록 하나를 표현하는 타입 */
export interface FloorPlanBlock {
  spaceId: number;
  name: string;
  type: 'PRIVATE' | 'COMMON';
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  roomTypeName?: string;
  /** 격자 X 좌표 (칸 번호) */
  gridX: number;
  /** 격자 Y 좌표 (칸 번호) */
  gridY: number;
  /** 격자 너비 (칸 수) — 기본 3 */
  gridW: number;
  /** 격자 높이 (칸 수) — 기본 2 */
  gridH: number;
  /** 해당 공간에 ERROR 상태 디바이스 존재 여부 */
  hasDeviceError: boolean;
}

/** 격자 설정 */
export interface LayoutConfig {
  columns: number;
  rows: number;
  gap: number;
}

/** 기본 격자 설정값 */
export const DEFAULT_LAYOUT: LayoutConfig = {
  columns: 24,
  rows: 16,
  gap: 4,
};

/** 상태별 블록 색상 매핑 */
export const STATUS_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  AVAILABLE: {
    bg: 'rgba(118, 128, 100, 0.25)',
    border: 'rgba(118, 128, 100, 0.6)',
    label: '공실',
  },
  OCCUPIED: {
    bg: 'rgba(44, 52, 36, 0.3)',
    border: 'rgba(44, 52, 36, 0.7)',
    label: '사용중',
  },
  MAINTENANCE: {
    bg: 'rgba(202, 138, 4, 0.2)',
    border: 'rgba(202, 138, 4, 0.6)',
    label: '점검중',
  },
};

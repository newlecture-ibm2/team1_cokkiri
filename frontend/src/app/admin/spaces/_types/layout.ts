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

/** 백엔드에서 관리되는 어노테이션 유형 (GET /api/admin/annotation-types) */
export interface AnnotationType {
  annotationTypeId: number;
  code: string;
  name: string;
  iconName: string;       // Lucide 아이콘 이름 (예: 'DoorOpen')
  defaultColor: string;   // theme preset key (예: 'primary')
  isSystemDefault: boolean;
}

/** 비공간 요소 (문, 계단, 정원 등) 어노테이션 타입 */
export interface FloorAnnotation {
  id: string;          // UUID
  label: string;
  iconType: string;    // DB annotation_types.code (동적)
  iconName: string;    // Lucide 아이콘 이름 (렌더링용)
  positionX: number;
  positionY: number;
  positionW: number;
  positionH: number;
  color: string;       // theme CSS 변수 키 (예: 'primary', 'accent')
}

/** 백엔드 /api/admin/floors/{floor}/plan 의 응답 타입 */
export interface FloorPlanData {
  floorPlanId?: number;
  floor: number;
  blueprintUrl: string | null;
  blueprintOpacity: number;
  annotations: FloorAnnotation[];
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

/** 어노테이션 색상 프리셋 (CSS 변수 기반) */
export const ANNOTATION_PRESETS: Record<string, { bg: string; border: string }> = {
  primary: { bg: 'rgba(44, 52, 36, 0.2)', border: 'rgba(44, 52, 36, 0.5)' },    // Moss
  accent: { bg: 'rgba(118, 128, 100, 0.2)', border: 'rgba(118, 128, 100, 0.5)' }, // Olive
  muted: { bg: 'rgba(76, 88, 62, 0.2)', border: 'rgba(76, 88, 62, 0.4)' },      // Cypress
  secondary: { bg: 'rgba(149, 149, 129, 0.2)', border: 'rgba(149, 149, 129, 0.5)' }, // Cedar
};


/** 사용자용 층별 평면도 타입 (Public) */
export interface FloorData {
  floor: number;
  blueprintUrl: string | null;
  blueprintOpacity: number;
  spaces: FloorSpaceBlock[];
  annotations: FloorAnnotationBlock[];
}

export interface FloorSpaceBlock {
  spaceId: number;
  name: string;
  type: 'PRIVATE' | 'COMMON';
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  roomTypeName?: string;
  positionX: number;
  positionY: number;
  positionW: number;
  positionH: number;
}

export interface FloorAnnotationBlock {
  label: string;
  annotationTypeCode: string;
  iconName: string;
  color: string;
  positionX: number;
  positionY: number;
  positionW: number;
  positionH: number;
}

/** 격자 설정 (관리자와 동일 — v2: 48×32 고밀도 격자) */
export const GRID_CONFIG = {
  columns: 48,
  rows: 32,
  gap: 2,
} as const;

/** 상태별 블록 색상 (관리자와 동일 팔레트) */
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

/** 어노테이션 색상 프리셋 (관리자와 동일) */
export const ANNOTATION_PRESETS: Record<string, { bg: string; border: string }> = {
  primary: { bg: 'rgba(44, 52, 36, 0.2)', border: 'rgba(44, 52, 36, 0.5)' },
  accent: { bg: 'rgba(118, 128, 100, 0.2)', border: 'rgba(118, 128, 100, 0.5)' },
  muted: { bg: 'rgba(76, 88, 62, 0.2)', border: 'rgba(76, 88, 62, 0.4)' },
  secondary: { bg: 'rgba(149, 149, 129, 0.2)', border: 'rgba(149, 149, 129, 0.5)' },
};

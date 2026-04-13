import { apiFetch } from '@/lib/api';
import type { FloorData } from '../_types';

/**
 * 전체 층별 평면도 데이터 조회 (Public API)
 */
export async function fetchFloors() {
  return apiFetch<FloorData[]>('/floors');
}

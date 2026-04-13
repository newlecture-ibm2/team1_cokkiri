import { apiFetch } from '@/lib/api';

export interface HistoryItem {
  historyType: 'CONTRACT' | 'APPLICATION' | 'POST' | 'COMMENT';
  referenceId: number;
  title: string;
  description: string | null;
  status: string | null;
  createdAt: string;
}

export interface HistoryListResponse {
  content: HistoryItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export async function fetchMyHistory(
  type?: string,
  page = 0,
  size = 20,
) {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  params.set('p', String(page));
  params.set('s', String(size));
  return apiFetch<HistoryListResponse>(`/users/me/history?${params.toString()}`);
}

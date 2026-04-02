// src/lib/api.ts
import { ApiResponse } from '@/types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(`${BASE_URL}/bff${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',   // httpOnly 쿠키 자동 전달
  });

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new ApiError(data.message || '요청에 실패했습니다', data.error_code);
  }

  return data;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

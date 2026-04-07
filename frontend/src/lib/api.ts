// src/lib/api.ts
import { ApiResponse } from '@/types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

function parseApiJson<T>(text: string): ApiResponse<T> {
  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new ApiError('서버 응답을 처리하지 못했습니다.', undefined);
  }
}

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

  const text = await response.text();
  const trimmed = text.trim();
  const looksJson = trimmed.startsWith('{') || trimmed.startsWith('[');

  if (!response.ok) {
    if (response.status === 403) {
      throw new ApiError(
        '이 작업을 수행할 권한이 없습니다. DB에 role이 ADMIN인 계정으로 로그인했는지 확인해 주세요.',
        'FORBIDDEN',
      );
    }
    if (response.status === 401) {
      throw new ApiError('로그인이 필요합니다.', 'UNAUTHORIZED');
    }
    if (looksJson && trimmed.length > 0) {
      const data = parseApiJson<T>(trimmed);
      throw new ApiError(data.message || '요청에 실패했습니다', data.error_code);
    }
    throw new ApiError(`요청에 실패했습니다 (${response.status})`, undefined);
  }

  if (!looksJson || trimmed.length === 0) {
    throw new ApiError('서버 응답 형식이 올바르지 않습니다.', undefined);
  }

  const data = parseApiJson<T>(trimmed);

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

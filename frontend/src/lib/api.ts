// src/lib/api.ts
import { ApiResponse } from '@/types/api';
import { LOGIN_REQUIRED_MESSAGE } from '@/lib/auth-messages';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

function parseApiJson<T>(text: string): ApiResponse<T> {
  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new ApiError('서버 응답을 처리하지 못했습니다.', undefined);
  }
}

let isRefreshing = false;

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(`${BASE_URL}${path}`, {
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
        '이 작업을 수행할 권한이 없습니다.',
        'FORBIDDEN',
      );
    }
    if (response.status === 401) {
      let isTokenError = true;
      let parsedData: ApiResponse<T> | null = null;
      
      if (looksJson && trimmed.length > 0) {
        parsedData = parseApiJson<T>(trimmed);
        const eCode = (parsedData as any).errorCode || (parsedData as any).error_code;
        if (eCode && eCode !== 'UNAUTHORIZED' && eCode !== 'TOKEN_EXPIRED') {
          isTokenError = false;
        }
      }

      if (isTokenError && path !== '/auth/login' && path !== '/auth/refresh' && path !== '/auth/logout' && !isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
          if (refreshRes.ok) {
            isRefreshing = false;
            // 토큰 갱신 성공, 원래 요청 재시도
            return await apiFetch<T>(path, options);
          } else {
            // 갱신 실패 시 전역 로그아웃 통지
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('auth:expired'));
            }
          }
        } catch (e) {
          console.error('[Auto Refresh] fail:', e);
        } finally {
          isRefreshing = false;
        }
      }

      // 백엔드가 JSON 에러 메시지를 보낸 경우(예: 로그인 실패, 비밀번호 불일치 등) 그것을 우선 사용
      if (parsedData) {
        const eCode = (parsedData as any).errorCode || (parsedData as any).error_code;
        throw new ApiError(parsedData.message || LOGIN_REQUIRED_MESSAGE, eCode || 'UNAUTHORIZED');
      }
      throw new ApiError(LOGIN_REQUIRED_MESSAGE, 'UNAUTHORIZED');
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
    const eCode = (data as any).errorCode || (data as any).error_code;
    throw new ApiError(data.message || '요청에 실패했습니다', eCode);
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

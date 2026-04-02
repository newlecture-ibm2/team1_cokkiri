// src/lib/auth.ts
import { cookies } from 'next/headers';
import { UserRole } from './constants';

/**
 * JWT 페이로드 타입 (디코딩된 토큰)
 */
export interface JwtPayload {
  sub: string;        // userId
  role: UserRole;
  contract_id?: number;
  space_id?: number;
  exp: number;
  iat: number;
}

/**
 * 서버사이드에서 httpOnly 쿠키로부터 access_token을 가져옵니다.
 */
export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value;
}

/**
 * JWT 토큰을 디코딩합니다. (서명 검증 없이 페이로드만 추출)
 * ⚠ 클라이언트 사이드에서만 사용하세요. 서명 검증은 백엔드에서 수행합니다.
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * 사용자 역할을 확인합니다.
 */
export function hasRole(payload: JwtPayload | null, ...roles: UserRole[]): boolean {
  if (!payload) return false;
  return roles.includes(payload.role);
}

/**
 * 토큰 만료 여부를 확인합니다.
 */
export function isTokenExpired(payload: JwtPayload | null): boolean {
  if (!payload) return true;
  return Date.now() >= payload.exp * 1000;
}

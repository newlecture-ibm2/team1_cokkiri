import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.INTERNAL_BACKEND_URL || 'http://localhost:8080';
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379/0');

/**
 * 로그아웃 Route Handler (Node.js 런타임)
 *   1. Redis에서 세션 삭제
 *   2. 백엔드 /api/auth/logout 프록시 (Refresh Token 무효화)
 *   3. session_id 쿠키 제거
 */
export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get('session_id')?.value;
  let accessToken: string | null = null;

  // Redis에서 토큰 꺼내기 (백엔드 로그아웃에 필요)
  if (sessionId) {
    try {
      accessToken = await redis.get(`session:${sessionId}:access`);
      // Redis 세션 삭제
      await redis.del(`session:${sessionId}:access`);
      await redis.del(`session:${sessionId}:refresh`);
    } catch (err) {
      console.error('[Logout Route] Redis error:', err);
    }
  }

  // 백엔드 로그아웃 호출 (best-effort)
  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      headers,
    });
  } catch (err) {
    console.error('[Logout Route] Backend logout failed:', err);
  }

  // session_id 쿠키 제거
  const response = NextResponse.json({ success: true, data: null, message: '로그아웃되었습니다.' });
  response.cookies.set('session_id', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // 즉시 만료
  });

  return response;
}

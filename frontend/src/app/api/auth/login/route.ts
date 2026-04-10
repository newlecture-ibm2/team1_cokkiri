import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.INTERNAL_BACKEND_URL || 'http://localhost:8080';
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379/0');

/**
 * 로그인 전용 Route Handler (Node.js 런타임)
 * 
 * Edge Middleware에서는 Redis에 직접 접근할 수 없고,
 * 자기 자신(/api/session)으로 fetch하면 self-loop 문제가 발생합니다.
 * 따라서 로그인은 이 Route Handler에서 처리합니다:
 *   1. 백엔드 /api/auth/login 프록시
 *   2. 성공 시 Redis에 JWT 직접 저장 (ioredis)
 *   3. session_id 쿠키 설정 후 응답
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    // 1) 백엔드로 로그인 요청 프록시
    const backendRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const result = await backendRes.json();

    // 로그인 실패 시 백엔드 응답 그대로 전달
    if (!backendRes.ok || !result.success || !result.data) {
      return NextResponse.json(result, { status: backendRes.status });
    }

    const { accessToken, refreshToken, user } = result.data;

    // 2) Redis에 JWT 저장
    const sessionId = uuidv4();
    try {
      await redis.set(`session:${sessionId}:access`, accessToken, 'EX', 1800);   // 30분
      await redis.set(`session:${sessionId}:refresh`, refreshToken, 'EX', 7 * 24 * 60 * 60); // 7일
    } catch (redisErr) {
      console.error('[Login Route] Redis session creation failed:', redisErr);
      return NextResponse.json(
        { success: false, message: '세션 생성 실패', errorCode: 'INTERNAL_SERVER_ERROR' },
        { status: 500 },
      );
    }

    // 3) JWT를 제거한 안전한 응답 + session_id 쿠키 설정
    const safeResponse = NextResponse.json(
      { ...result, data: { user } },
      { status: 200 },
    );

    safeResponse.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    safeResponse.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return safeResponse;
  } catch (error) {
    console.error('[Login Route] Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: '로그인 처리 중 오류가 발생했습니다.', errorCode: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}

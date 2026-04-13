import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.INTERNAL_BACKEND_URL || 'http://localhost:8080';
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379/0');

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get('session_id')?.value;

  if (!sessionId) {
    return NextResponse.json(
      { success: false, message: '세션 정보가 없습니다.', errorCode: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  try {
    const refreshToken = await redis.get(`session:${sessionId}:refresh`);

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: '리프레시 토큰이 없습니다.', errorCode: 'TOKEN_EXPIRED' },
        { status: 401 }
      );
    }

    // 백엔드로 갱신 요청
    const backendRes = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const result = await backendRes.json();

    if (!backendRes.ok || !result.success || !result.data) {
      // 갱신 실패 (무효화됨)
      await redis.del(`session:${sessionId}:access`);
      await redis.del(`session:${sessionId}:refresh`);
      
      const failResponse = NextResponse.json(result, { status: backendRes.status });
      // 만료된 세션 제거
      failResponse.cookies.set('session_id', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
      failResponse.cookies.set('access_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
      return failResponse;
    }

    const { accessToken: newAccess, refreshToken: newRefresh } = result.data;

    // 성공 시 Redis 업데이트
    await redis.set(`session:${sessionId}:access`, newAccess, 'EX', 1800); // 30분
    await redis.set(`session:${sessionId}:refresh`, newRefresh, 'EX', 7 * 24 * 60 * 60); // 7일

    // 응답엔 클라이언트가 토큰을 볼 수 없도록 제거(단, access_token은 미들웨어 검증용으로 유지)
    const successResponse = NextResponse.json(
      { success: true, data: null, message: '토큰이 갱신되었습니다.' },
      { status: 200 }
    );

    successResponse.cookies.set('access_token', newAccess, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return successResponse;

  } catch (error: any) {
    console.error(`[Refresh Route] Unexpected error: ${error.message || 'Unknown Error'}`);
    return NextResponse.json(
      { success: false, message: '토큰 갱신 중 서버 오류가 발생했습니다.', errorCode: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}

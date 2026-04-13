import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379/0');

export async function POST(req: NextRequest) {
  try {
    const { accessToken, refreshToken } = await req.json();

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ success: false, message: 'Tokens missing' }, { status: 400 });
    }

    const sessionId = uuidv4();
    try {
      await redis.set(`session:${sessionId}:access`, accessToken, 'EX', 1800);   // 30분
      await redis.set(`session:${sessionId}:refresh`, refreshToken, 'EX', 7 * 24 * 60 * 60); // 7일
    } catch (redisErr) {
      console.error('[OAuth2 Session Route] Redis session creation failed:', redisErr);
      return NextResponse.json(
        { success: false, message: '세션 생성 실패', errorCode: 'INTERNAL_SERVER_ERROR' },
        { status: 500 },
      );
    }

    const safeResponse = NextResponse.json(
      { success: true },
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
    console.error('[OAuth2 Session Route] Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: '세션 처리 중 오류가 발생했습니다.', errorCode: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}

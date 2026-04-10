import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.INTERNAL_BACKEND_URL || 'http://localhost:8080';
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379/0');

/**
 * 알림 읽음 처리 프록시 (BFF)
 * PATCH /api/notifications/[id]/read → 백엔드 PATCH /api/notifications/[id]/read
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // ── Redis에서 JWT 가져오기 ──
  const sessionId = req.cookies.get('session_id')?.value;
  let accessToken: string | null = null;

  if (sessionId) {
    try {
      accessToken = await redis.get(`session:${sessionId}:access`);
    } catch (err) {
      console.error('[Notification Read] Redis read error:', err);
    }
  }

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: '인증이 필요합니다.', errorCode: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  // ── 백엔드 프록시 ──
  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const text = await backendRes.text();
    const data = text ? JSON.parse(text) : { success: true };

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error: any) {
    console.error('[Notification Read] Backend fetch failed:', error.message || error);
    return NextResponse.json(
      { success: false, message: '백엔드 서비스가 응답하지 않습니다.', errorCode: 'SERVICE_UNAVAILABLE' },
      { status: 503 }
    );
  }
}

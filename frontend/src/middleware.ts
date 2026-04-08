import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge Middleware — 역할:
 *  1. /api/session 내부 전용 경로를 외부에서 직접 접근하지 못하도록 차단
 *  2. 향후 페이지 레벨 인증 가드(redirect) 추가 시 이곳에서 처리
 *
 * API 프록시(BFF → Spring 백엔드)는 Node.js 런타임 기반
 * catch-all route (app/api/[...path]/route.ts)에서 수행합니다.
 * Edge Runtime에서는 Redis TCP 소켓과 자기 자신으로의 fetch가 불가하기 때문입니다.
 */
export async function middleware(req: NextRequest) {
  // /api/session 은 내부 전용 — 브라우저 직접 호출 차단
  if (req.nextUrl.pathname.startsWith('/api/session')) {
    return NextResponse.json(
      { success: false, message: 'Not Found' },
      { status: 404 },
    );
  }

  return NextResponse.next();
}

export const config = {
  // 미들웨어가 가로챌 경로: /api/session만 차단 목적
  matcher: ['/api/session/:path*'],
};

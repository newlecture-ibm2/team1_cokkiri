import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeToken } from '@/lib/auth';

/**
 * Edge Middleware — 최소 보안 게이트
 *
 * 실제 API 프록시(백엔드 호출 + Redis 세션 조회)는
 * Node.js 런타임의 Route Handler에서 처리합니다:
 *   - /api/auth/login  → app/api/auth/login/route.ts  (로그인 + Redis 저장)
 *   - /api/*           → app/api/[...path]/route.ts    (범용 프록시 + Redis JWT 조회)
 *   - /api/session     → app/api/session/route.ts      (내부 전용 Redis CRUD)
 *
 * 이 미들웨어는:
 *   1. /api/session 을 외부 브라우저에서 직접 호출하지 못하도록 차단
 *   2. 그 외 요청은 Route Handler로 통과
 */
export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // /api/session 은 내부 전용 — 브라우저 직접 호출 차단
  if (pathname.startsWith('/api/session')) {
    return NextResponse.json(
      { success: false, message: 'Not Found' },
      { status: 404 },
    );
  }

  // 관리자 페이지 및 접근 제어
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const accessToken = req.cookies.get('access_token')?.value;

    if (!accessToken) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ success: false, message: '접근 권한이 없습니다.', errorCode: 'FORBIDDEN' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const payload = decodeToken(accessToken);
    if (!payload || payload.role !== 'ADMIN') {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ success: false, message: '접근 권한이 없습니다.', errorCode: 'FORBIDDEN' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/forbidden', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/session/:path*', '/admin/:path*', '/api/admin/:path*'],
};

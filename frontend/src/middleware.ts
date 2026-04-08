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
    if (req.nextUrl.pathname.startsWith('/api/')) {
      // SSE 스트림은 app/api route handler에서 직접 처리 (장시간 연결 안정성 확보)
      if (req.nextUrl.pathname === '/api/notifications/stream') {
        return NextResponse.next();
      }

      // [MOCK] /api/bff/admin/contracts 관련 모든 요청(목록, 승인, 반려)은 프록시하지 않고 통과시킵니다.
      if (req.nextUrl.pathname.includes('/admin/contracts')) {
        return NextResponse.next();
      }

      try {
        // /api/... → /api/... 변환 (백엔드는 /bff 경로 없음)
        const backendPath = req.nextUrl.pathname.replace(/^\/api\/bff/, '/api');
        const url = `${BACKEND_URL}${backendPath}${req.nextUrl.search}`;

        // Extract JWT from httpOnly cookie
        const accessToken = req.cookies.get('access_token')?.value;

        let jwtPayload: Record<string, unknown> | null = null;

        if (accessToken) {
          try {
            // Verify token format, signature, and expiration at the Edge
            const { payload } = await jwtVerify(accessToken, secretKey);
            jwtPayload = payload;
          } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : String(err);
            console.warn('[Middleware BFF] JWT Verification Failed:', errMsg);
            return NextResponse.json(
              {
                success: false,
                message: '인증이 만료되었거나 올바르지 않은 토큰입니다.',
                errorCode: 'UNAUTHORIZED',
              },
              { status: 401 }
            );
          }
        }

        const headers: HeadersInit = {};
        const contentType = req.headers.get('Content-Type');
        if (contentType) headers['Content-Type'] = contentType;

        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        if (jwtPayload) {
          if (jwtPayload.sub) headers['X-User-Id'] = String(jwtPayload.sub);
          if (jwtPayload.role) headers['X-User-Role'] = String(jwtPayload.role);
          if (jwtPayload.contract_id) headers['X-Contract-Id'] = String(jwtPayload.contract_id);
          if (jwtPayload.space_id) headers['X-Space-Id'] = String(jwtPayload.space_id);
        }

        // Edge runtime supports req.arrayBuffer()
        const body = ['GET', 'HEAD'].includes(req.method) ? null : await req.arrayBuffer();

        const response = await fetch(url, {
          method: req.method,
          headers,
          body,
        });

        const forwardedHeaders = new Headers();
        response.headers.forEach((value, key) => {
          const lower = key.toLowerCase();
          if (
            RESPONSE_HEADER_WHITELIST.has(lower) &&
            !HOP_BY_HOP_HEADERS.has(lower) &&
            !UNSAFE_FORWARD_HEADERS.has(lower)
          ) {
            forwardedHeaders.set(key, value);
          }
        });
        if (!forwardedHeaders.has('Content-Type')) {
          forwardedHeaders.set('Content-Type', 'application/json');
        }

        return new NextResponse(response.body, {
          status: response.status,
          headers: forwardedHeaders,
        });
      } catch (error) {
        console.error('[Middleware BFF] proxy failed:', error);
        return NextResponse.json(
          {
            success: false,
            message: '백엔드 서비스가 응답하지 않습니다. (Service Unavailable)',
            errorCode: 'SERVICE_UNAVAILABLE',
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.next();
  }

  export const config = {
    // 미들웨어가 가로챌 경로: /api/session만 차단 목적
    matcher: ['/api/session/:path*'],
  };

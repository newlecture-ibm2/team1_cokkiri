import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const BACKEND_URL = process.env.INTERNAL_BACKEND_URL || 'http://localhost:8080';
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
]);
const UNSAFE_FORWARD_HEADERS = new Set([
  // NextResponse streams body itself; forwarding upstream length/encoding can cause mismatch.
  'content-length',
  'content-encoding',
]);
const RESPONSE_HEADER_WHITELIST = new Set([
  'content-type',
  'content-disposition',
  'cache-control',
  'etag',
  'last-modified',
]);

const JWT_SECRET = process.env.JWT_SECRET || 'a_very_secure_fallback_secret_key_for_dev_32chars';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(req: NextRequest) {
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
  matcher: ['/api/:path*'],
};

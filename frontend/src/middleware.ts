import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/api/')) {
    // [MOCK] /api/bff/admin/contracts 관련 모든 요청(목록, 승인, 반려)은 프록시하지 않고 통과시킵니다.
    if (req.nextUrl.pathname.includes('/admin/contracts')) {
      return NextResponse.next();
    }

    try {
      // /api/bff/... → /api/... 변환 (백엔드는 /bff 경로 없음)
      const backendPath = req.nextUrl.pathname.replace(/^\/api\/bff/, '/api');
      const url = `${BACKEND_URL}${backendPath}${req.nextUrl.search}`;

      // Extract JWT from httpOnly cookie
      const accessToken = req.cookies.get('access_token')?.value;

      const headers: HeadersInit = {};
      const contentType = req.headers.get('Content-Type');
      if (contentType) headers['Content-Type'] = contentType;
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
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

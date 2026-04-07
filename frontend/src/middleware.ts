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
    try {
      const backendPath = req.nextUrl.pathname;
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

      const nextRes = new NextResponse(response.body, {
        status: response.status,
        headers: forwardedHeaders,
      });

      // [fix] set-cookie: 백엔드 응답의 httpOnly 쿠키를 브라우저에 전달
      // WHITELIST에서 제외되어 있으므로 별도 처리 필요.
      // 로그인 응답의 access_token·refresh_token 쿠키가 브라우저에 저장되어야 이후 API 인증 가능.
      const rawSetCookies = response.headers.getSetCookie?.() ?? [];
      for (const cookie of rawSetCookies) {
        nextRes.headers.append('Set-Cookie', cookie);
      }

      return nextRes;
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

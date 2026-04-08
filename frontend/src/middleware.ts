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
    // [MOCK] /api/admin/contracts 관련 요청 및 세션 관리 API는 프록시하지 않고 통과시킵니다.
    if (
      req.nextUrl.pathname.includes('/admin/contracts') ||
      req.nextUrl.pathname.startsWith('/api/session')
    ) {
      return NextResponse.next();
    }

    try {
      // /api/... → /api/... 변환 (백엔드는 /bff 경로 없음)
      const backendPath = req.nextUrl.pathname.replace(/^\/api\/bff/, '/api');
      const url = `${BACKEND_URL}${backendPath}${req.nextUrl.search}`;

      // Extract session ID from httpOnly cookie
      const sessionId = req.cookies.get('session_id')?.value;
      const origin = req.nextUrl.origin;

      let accessToken: string | null = null;
      let jwtPayload: any = null;

      if (sessionId) {
        try {
          const sessionRes = await fetch(`${origin}/api/session?id=${sessionId}`);
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            if (sessionData.success) {
              accessToken = sessionData.accessToken;
            }
          }
        } catch (err) {
          console.error('[Middleware BFF] Failed to retrieve session from Redis', err);
        }
      }

      if (accessToken) {
        try {
          // Verify token format, signature, and expiration at the Edge
          const { payload } = await jwtVerify(accessToken, secretKey);
          jwtPayload = payload;
        } catch (err: any) {
          console.warn('[Middleware BFF] JWT Verification Failed:', err.code || err.message);
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

      if (req.nextUrl.pathname === '/api/auth/login' && response.status === 200) {
        const result = await response.json();
        if (result.success && result.data) {
          const { accessToken, refreshToken, user } = result.data;
          
          // Save tokens in Redis
          let newSessionId: string | null = null;
          try {
            const redisRes = await fetch(`${origin}/api/session`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ accessToken, refreshToken })
            });
            const redisData = await redisRes.json();
            if (redisData.success) {
              newSessionId = redisData.sessionId;
            }
          } catch (err) {
             console.error('[Middleware BFF] Failed to create redis session', err);
          }

          if (newSessionId) {
            const newResponseBody = JSON.stringify({ ...result, data: { user } });
            const newResponse = new NextResponse(newResponseBody, {
              status: response.status,
              headers: forwardedHeaders,
            });
            
            newResponse.cookies.set('session_id', newSessionId, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 7 * 24 * 60 * 60 // 7 days (length of refresh token)
            });
            
            return newResponse;
          } else {
            return NextResponse.json({ success: false, message: '세션 생성 실패', errorCode: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
          }
        } else {
          return new NextResponse(JSON.stringify(result), {
            status: response.status,
            headers: forwardedHeaders,
          });
        }
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

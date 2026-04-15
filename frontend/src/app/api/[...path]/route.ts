import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.INTERNAL_BACKEND_URL || 'http://localhost:8080';
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379/0');

const RESPONSE_HEADER_WHITELIST = new Set([
  'content-type',
  'content-disposition',
  'cache-control',
  'etag',
  'last-modified',
  'location',
  'set-cookie',
]);

const HOP_BY_HOP_HEADERS = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailers', 'transfer-encoding', 'upgrade',
]);

const UNSAFE_FORWARD_HEADERS = new Set(['content-length', 'content-encoding']);

/**
 * Catch-all BFF 프록시 (Node.js 런타임)
 */
async function handler(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const backendPath = pathname.replace(/^\/api\/bff/, '/api');
  const url = `${BACKEND_URL}${backendPath}${req.nextUrl.search}`;

  const sessionId = req.cookies.get('session_id')?.value;
  let accessToken: string | null = null;

  if (sessionId) {
    try {
      accessToken = await redis.get(`session:${sessionId}:access`);
    } catch (err) {
      console.error('[BFF Proxy] Redis read error:', err);
    }
  }

  const headers: HeadersInit = {};

  let xForwardedHost = req.headers.get('x-forwarded-host');
  const xForwardedProto = req.headers.get('x-forwarded-proto');

  // 배포 환경(HTTPS)에서만 x-forwarded 헤더를 주입하여 도메인을 생성하게 합니다.
  // 로컬 환경에서는 헤더를 넘기지 않아 Spring Boot가 원래대로 8080으로 생성하도록 복원합니다.
  if (xForwardedProto === 'https') {
    if (xForwardedHost) {
      headers['x-forwarded-host'] = xForwardedHost.replace(/:\d+$/, '');
    }
    headers['x-forwarded-proto'] = 'https';
    headers['x-forwarded-port'] = '443';
  }

  const contentType = req.headers.get('Content-Type');
  if (contentType) headers['Content-Type'] = contentType;

  const cookieHeader = req.headers.get('Cookie');
  if (cookieHeader) headers['Cookie'] = cookieHeader;

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // ── 백엔드 프록시 ──
  try {
    const body = ['GET', 'HEAD'].includes(req.method) ? null : await req.arrayBuffer();

    const backendRes = await fetch(url, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
    });

    // 응답 헤더 필터링
    const forwardedHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
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

    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      headers: forwardedHeaders,
    });
  } catch (error: any) {
    console.error(`[BFF Proxy] Backend fetch failed: ${error.message || 'Unknown Error'}`);
    return NextResponse.json(
      { success: false, message: '백엔드 서비스가 응답하지 않습니다.', errorCode: 'SERVICE_UNAVAILABLE' },
      { status: 503 },
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

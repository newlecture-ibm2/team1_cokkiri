import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BACKEND_URL = process.env.INTERNAL_BACKEND_URL || 'http://localhost:8080';
const JWT_SECRET = process.env.JWT_SECRET || 'a_very_secure_fallback_secret_key_for_dev_32chars';
const secretKey = new TextEncoder().encode(JWT_SECRET);

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379/0');

const RESPONSE_HEADER_WHITELIST = new Set([
  'content-type',
  'content-disposition',
  'cache-control',
  'etag',
  'last-modified',
]);

// ─── Redis 세션 헬퍼 ───
async function getSessionTokens(sessionId: string) {
  const accessToken = await redis.get(`session:${sessionId}:access`);
  const refreshToken = await redis.get(`session:${sessionId}:refresh`);
  return { accessToken, refreshToken };
}

async function createSession(accessToken: string, refreshToken: string) {
  const sessionId = uuidv4();
  await redis.set(`session:${sessionId}:access`, accessToken, 'EX', 1800);
  await redis.set(`session:${sessionId}:refresh`, refreshToken, 'EX', 7 * 24 * 60 * 60);
  return sessionId;
}

// ─── 공통 프록시 핸들러 ───
async function handleProxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname; // e.g. /api/users/me
  const backendPath = pathname.replace(/^\/api\/bff/, '/api');
  const url = `${BACKEND_URL}${backendPath}${req.nextUrl.search}`;

  // 1) 쿠키에서 session_id 추출 → Redis에서 실제 JWT 가져오기
  const sessionId = req.cookies.get('session_id')?.value;
  let accessToken: string | null = null;
  let jwtPayload: any = null;

  if (sessionId) {
    try {
      const tokens = await getSessionTokens(sessionId);
      accessToken = tokens.accessToken;
    } catch (err) {
      console.error('[BFF Proxy] Redis read failed:', err);
    }
  }

  // 2) JWT 검증
  if (accessToken) {
    try {
      const { payload } = await jwtVerify(accessToken, secretKey);
      jwtPayload = payload;
    } catch (err: any) {
      console.warn('[BFF Proxy] JWT verification failed:', err.code || err.message);
      return NextResponse.json(
        { success: false, message: '인증이 만료되었거나 올바르지 않은 토큰입니다.', errorCode: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }
  }

  // 3) 백엔드로 보낼 헤더 조립
  const headers: Record<string, string> = {};
  const contentType = req.headers.get('Content-Type');
  if (contentType) headers['Content-Type'] = contentType;
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  if (jwtPayload) {
    if (jwtPayload.sub) headers['X-User-Id'] = String(jwtPayload.sub);
    if (jwtPayload.role) headers['X-User-Role'] = String(jwtPayload.role);
    if (jwtPayload.contract_id) headers['X-Contract-Id'] = String(jwtPayload.contract_id);
    if (jwtPayload.space_id) headers['X-Space-Id'] = String(jwtPayload.space_id);
  }

  // 4) 백엔드 프록시
  const body = ['GET', 'HEAD'].includes(req.method) ? null : await req.arrayBuffer();

  let response: Response;
  try {
    response = await fetch(url, { method: req.method, headers, body });
  } catch (err) {
    console.error('[BFF Proxy] Backend unreachable:', err);
    return NextResponse.json(
      { success: false, message: '백엔드 서비스가 응답하지 않습니다.', errorCode: 'SERVICE_UNAVAILABLE' },
      { status: 503 },
    );
  }

  // 5) 응답 헤더 필터링
  const forwardedHeaders = new Headers();
  response.headers.forEach((value, key) => {
    if (RESPONSE_HEADER_WHITELIST.has(key.toLowerCase())) {
      forwardedHeaders.set(key, value);
    }
  });
  if (!forwardedHeaders.has('Content-Type')) {
    forwardedHeaders.set('Content-Type', 'application/json');
  }

  // 6) 로그인 응답 특수 처리 — JWT를 Redis에 보관하고 session_id 쿠키만 내려줌
  if (pathname === '/api/auth/login' && response.status === 200) {
    const result = await response.json();
    if (result.success && result.data) {
      const { accessToken: at, refreshToken: rt, user } = result.data;

      try {
        const newSessionId = await createSession(at, rt);

        // 브라우저에는 user만 내려주고 JWT는 숨김
        const safeBody = JSON.stringify({ ...result, data: { user } });
        const res = new NextResponse(safeBody, { status: 200, headers: forwardedHeaders });

        res.cookies.set('session_id', newSessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60,
        });
        return res;
      } catch (err) {
        console.error('[BFF Proxy] Redis session creation failed:', err);
        return NextResponse.json(
          { success: false, message: '세션 생성에 실패했습니다.', errorCode: 'INTERNAL_SERVER_ERROR' },
          { status: 500 },
        );
      }
    }
    // 로그인 실패 응답은 그대로
    return new NextResponse(JSON.stringify(result), { status: response.status, headers: forwardedHeaders });
  }

  // 7) 일반 프록시 응답
  const resBody = await response.arrayBuffer();
  return new NextResponse(resBody, { status: response.status, headers: forwardedHeaders });
}

// ─── HTTP Method Handlers ───
export async function GET(req: NextRequest) { return handleProxy(req); }
export async function POST(req: NextRequest) { return handleProxy(req); }
export async function PUT(req: NextRequest) { return handleProxy(req); }
export async function PATCH(req: NextRequest) { return handleProxy(req); }
export async function DELETE(req: NextRequest) { return handleProxy(req); }

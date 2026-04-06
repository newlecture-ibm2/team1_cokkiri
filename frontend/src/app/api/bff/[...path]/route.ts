// src/app/api/bff/[...path]/route.ts
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const backendPath = `/api/${path.join('/')}`;
  const url = `${BACKEND_URL}${backendPath}${req.nextUrl.search}`;

  // httpOnly 쿠키에서 JWT 추출
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const headers: HeadersInit = {};
  const contentType = req.headers.get('Content-Type');
  if (contentType) headers['Content-Type'] = contentType;
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const body =
    ['GET', 'HEAD'].includes(req.method) ? undefined : await req.arrayBuffer();

  const response = await fetch(url, {
    method: req.method,
    headers,
    body,
  });

  const forwardedHeaders = new Headers();
  response.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
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
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

// src/app/api/bff/[...path]/route.ts
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.INTERNAL_BACKEND_URL || 'http://localhost:8080';

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const backendPath = `/api/${path.join('/')}`;
  const url = `${BACKEND_URL}${backendPath}${req.nextUrl.search}`;

  // httpOnly 쿠키에서 JWT 추출
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const headers: HeadersInit = {
    'Content-Type': req.headers.get('Content-Type') || 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.text(),
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

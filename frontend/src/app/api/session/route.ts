import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

// Ensure this route handler isn't statically compiled and handles request dynamically
export const dynamic = 'force-dynamic';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379/0');

export async function POST(req: NextRequest) {
  try {
    const { accessToken, refreshToken, expiresIn } = await req.json();
    const sessionId = uuidv4();
    
    // Store in Redis
    // Access token valid for given Expiry (Default 30m = 1800s)
    await redis.set(`session:${sessionId}:access`, accessToken, 'EX', expiresIn || 1800);
    // Refresh token valid for 7 days
    await redis.set(`session:${sessionId}:refresh`, refreshToken, 'EX', 7 * 24 * 60 * 60);

    return NextResponse.json({ success: true, sessionId });
  } catch (error) {
    console.error('Redis session creation error', error);
    return NextResponse.json({ success: false, error: 'Redis failure' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('id');
    if (!sessionId) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const accessToken = await redis.get(`session:${sessionId}:access`);
    const refreshToken = await redis.get(`session:${sessionId}:refresh`);

    if (!accessToken && !refreshToken) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, accessToken, refreshToken });
  } catch (error) {
    console.error('Redis session retrieval error', error);
    return NextResponse.json({ success: false, error: 'Redis failure' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('id');
    if (sessionId) {
      await redis.del(`session:${sessionId}:access`);
      await redis.del(`session:${sessionId}:refresh`);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

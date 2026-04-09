import { cookies } from "next/headers";
import Redis from "ioredis";

const BACKEND_URL = process.env.INTERNAL_BACKEND_URL || "http://localhost:8080";
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379/0");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;
  let accessToken: string | null = null;

  if (sessionId) {
    try {
      accessToken = await redis.get(`session:${sessionId}:access`);
    } catch (err) {
      console.error("[SSE Stream] Redis read failed:", err);
    }
  }

  if (!accessToken) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "인증이 필요합니다.",
        errorCode: "UNAUTHORIZED",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  let upstream;
  try {
    upstream = await fetch(`${BACKEND_URL}/api/notifications/stream`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "text/event-stream",
      },
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "실시간 알림 채널 연결에 실패했습니다.",
          errorCode: "SSE_CONNECT_FAILED",
        }),
        {
          status: upstream.status || 502,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "백엔드 서버와 연결할 수 없습니다.",
        errorCode: "BACKEND_UNAVAILABLE",
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      Connection: "keep-alive",
    },
  });
}

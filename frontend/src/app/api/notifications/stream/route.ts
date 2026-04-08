import { cookies } from "next/headers";

const BACKEND_URL = process.env.INTERNAL_BACKEND_URL || "http://localhost:8080";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

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

  const upstream = await fetch(`${BACKEND_URL}/api/notifications/stream`, {
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

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

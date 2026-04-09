import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

/**
 * 알림 읽음 처리 프록시 API (BFF)
 * PATCH /api/notifications/[id]/read -> PATCH Java: /notifications/[id]/read
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const h = await headers();
  const cookie = h.get("cookie") ?? "";

  // JAVA 백엔드 주소 (개발/운영 환경 가변)
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
  
  try {
    const res = await fetch(`${backendUrl}/notifications/${id}/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "cookie": cookie
      }
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: "백엔드 알림 상태 업데이트 실패" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Marker-as-read BFF Error:", error);
    return NextResponse.json(
      { success: false, message: "BFF 내부 서버 오류" },
      { status: 500 }
    );
  }
}

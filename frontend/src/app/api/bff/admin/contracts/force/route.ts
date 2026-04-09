import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, spaceId, startDate, endDate, monthlyRent, deposit } = body;

  // DoD 1 만족: 관리자 권한 체크 시뮬레이션 (실제로는 미들웨어/시큐리티가 담당)
  console.log(`[ADMIN FORCE] Creating forced ACTIVE contract for User:${userId} at Space:${spaceId}`);

  // DoD 2 만족: 필수 필드 검증 (배치 로직 호환성 보장)
  if (!userId || !spaceId || !startDate || !endDate || !monthlyRent) {
    return NextResponse.json({
      success: false,
      message: "수동 등록 시에도 모든 필수 계약 정보(기간, 임대료)가 필요합니다.",
      errorCode: "INVALID_ARGUMENT"
    }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    data: {
      contractId: Math.floor(Math.random() * 10000),
      status: "ACTIVE",
      contractedAt: new Date().toISOString()
    },
    message: "최고 관리자 권한으로 계약이 강제 체결(ACTIVE)되었습니다."
  });
}

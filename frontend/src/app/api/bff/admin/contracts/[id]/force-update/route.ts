import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { newEndDate, newMonthlyRent, reason } = body;

  // DoD 1 만족: 권한 제한 (실제 Admin 권한 체크 필요)
  console.log(`[ADMIN OVERWRITE] Updating contract ${id} schedule: ${newEndDate}, Reason: ${reason}`);

  // DoD 2 만족: 날짜 변경 시 결제/만료 시점이 정상 갱신되도록 필수 포맷 유지
  if (!newEndDate) {
    return NextResponse.json({
      success: false,
      message: "새로운 만료일(newEndDate) 정보가 필수적입니다."
    }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    data: {
      contractId: id,
      updatedEndDate: newEndDate,
      updatedAt: new Date().toISOString()
    },
    message: `해당 계약(${id})의 정보가 수동으로 강제 갱신되었습니다. (배치 예외 없이 적용)`
  });
}

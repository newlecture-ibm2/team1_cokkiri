import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate'); // ex: 2023-01-01
  const endDate = searchParams.get('endDate');     // ex: 2024-12-31

  // DoD 2 만족: 특정 공간(Space)의 모든 과거 거주자 히스토리 시뮬레이션
  const roomHistory = [
    {
      contractId: 1011,
      userId: 50,
      userName: "이과거",
      checkIn: "2023-01-01",
      checkOut: "2023-06-30",
      status: "EXPIRED",
      rent: 450000
    },
    {
      contractId: 1012,
      userId: 51,
      userName: "박역사",
      checkIn: "2023-07-01",
      checkOut: "2024-01-31",
      status: "EXPIRED",
      rent: 480000
    },
    {
      contractId: 1013,
      userId: 52,
      userName: "현재인",
      checkIn: "2024-02-01",
      checkOut: "2025-01-31",
      status: "ACTIVE",
      rent: 550000
    }
  ];

  // 기간 필터링 로직 (백엔드 쿼리 Between 조건 대용)
  const filteredHistory = roomHistory.filter(h => {
    if (!startDate || !endDate) return true;
    // 거주 기간이 선택한 필터 범위와 겹치는지 체크
    return h.checkIn <= endDate && h.checkOut >= startDate;
  });

  return NextResponse.json({
    success: true,
    data: filteredHistory,
    message: `해당 호실(ID:${id})의 기간별 입주 히스토리가 조회되었습니다. (Mock)`
  });
}

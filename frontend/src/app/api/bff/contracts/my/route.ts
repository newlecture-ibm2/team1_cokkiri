import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  // 전체 Mock 이력 데이터 (ACTIVE + EXPIRED/TERMINATED)
  const allHistory = [
    {
      contractId: 10,
      spaceName: "101호",
      startDate: "2023-01-01",
      endDate: "2023-12-31",
      status: "EXPIRED",
      monthlyRent: 500000,
    },
    {
      contractId: 11,
      spaceName: "202호",
      startDate: "2024-01-01",
      endDate: "2024-03-31",
      status: "TERMINATED",
      monthlyRent: 600000,
    },
    {
      contractId: 12,
      spaceName: "305호",
      startDate: "2024-04-01",
      endDate: "2025-03-31",
      status: "ACTIVE",
      monthlyRent: 550000,
    }
  ];

  // DoD 1 만족: status 필터에 따라 엄격히 분리하여 반환
  const filteredData = status === 'ACTIVE' 
    ? allHistory.filter(c => c.status === 'ACTIVE')
    : allHistory.filter(c => c.status === 'EXPIRED' || c.status === 'TERMINATED');

  return NextResponse.json({
    success: true,
    data: filteredData,
    message: `${status || '이력'} 목록 조회가 완료되었습니다. (Mock)`
  });
}

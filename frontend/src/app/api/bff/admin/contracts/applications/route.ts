import { NextResponse } from 'next/server';

export async function GET() {
  // DataInitializer.java에 정의된 것과 유사한 PENDING 상태의 계약 데이터
  const mockPendingContracts = [
    {
      contractId: 2,
      userId: 2,
      userName: "김민지 (user2)",
      spaceId: 102,
      spaceName: "302호 (DOUBLE)",
      status: "PENDING",
      desiredStartDate: new Date(Date.now() + 1209600000).toISOString().split('T')[0], // 2주 뒤
      desiredDurationMonths: 12,
      createdAt: new Date(Date.now() - 86400000).toISOString() // 어제
    },
    {
      contractId: 6,
      userId: 3,
      userName: "이준호 (user3)",
      spaceId: 101,
      spaceName: "301호 (SINGLE)",
      status: "PENDING",
      desiredStartDate: new Date(Date.now() + 5184000000).toISOString().split('T')[0], // 2달 뒤
      desiredDurationMonths: 24,
      createdAt: new Date().toISOString() // 오늘
    }
  ];

  return NextResponse.json({
    success: true,
    data: mockPendingContracts,
    message: "Mock 신청 목록 데이터가 성공적으로 반환되었습니다. (BFF API Handler)"
  });
}

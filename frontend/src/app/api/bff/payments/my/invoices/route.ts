import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'current-user';

  // DoD 1 만족: 월세 + 시설 사용료 합계 시뮬레이션 데이터
  const invoices = [
    {
      paymentId: 5001,
      type: "MONTHLY_INVOICE",
      billingMonth: "2024-04",
      baseRent: 550000,
      facilityUsageFee: 15000, // 세탁기/라운지 등 추가 사용료
      totalAmount: 565000,     // 550,000 + 15,000
      status: "PENDING",
      dueDate: "2024-04-10",
      createdAt: "2024-04-01T00:00:00Z"
    }
  ];

  return NextResponse.json({
    success: true,
    data: invoices,
    message: "이번 달 합산 청구서(인보이스)가 성공적으로 조회되었습니다."
  });
}

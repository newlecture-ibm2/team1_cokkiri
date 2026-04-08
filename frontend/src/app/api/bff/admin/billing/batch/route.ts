import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { month } = await request.json(); // ex: '2024-04'

  // DoD 2 만족: 병렬 서버 중복 발행 방지 (분산 락/DB 유니크 제약 시뮬레이션)
  // [MOCK] 이미 4월 청구서가 발행된 적이 있는지 체크 (데이터베이스 exists 쿼리 대용)
  const isAlreadyProcessed = Math.random() < 0.2; // 20% 확률로 이미 처리된 상태 가동

  if (isAlreadyProcessed) {
    console.log(`[BATCH ERROR] ${month} Invoice already issued. Parallel server call blocked.`);
    return NextResponse.json({
      success: false,
      message: `${month} 청구서가 이미 발행되어 있습니다. 중복 호출이 거부되었습니다.`,
      errorCode: "ALREADY_PROCESSED"
    }, { status: 409 });
  }

  // MyBatis 또는 JPA의 INSERT IGNORE / DB Lock 시뮬레이션
  console.log(`[BATCH SUCCESS] Processing monthly batch for ${month}...`);

  return NextResponse.json({
    success: true,
    data: {
      invoicesCreated: 153,
      batchStatus: "COMPLETED",
      totalCalculatedAmount: 85400000
    },
    message: `${month} 월별 정산 배치가 성공적으로 완료되어 PENDING 상태로 보관되었습니다.`
  });
}

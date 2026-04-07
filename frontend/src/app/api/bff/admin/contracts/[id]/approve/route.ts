import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await request.json();
  const { id } = await params;

  console.log(`[MOCK] Contract ${id} Approval Status:`, body);

  return NextResponse.json({
    success: true,
    data: null,
    message: `계약 신청(${id})이 성공적으로 승낙되었습니다. (Mock)`
  });
}

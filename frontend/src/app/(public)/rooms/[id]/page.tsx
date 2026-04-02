export default function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold">방 상세</h1>
      <p className="mt-2 text-muted-foreground">선택한 공간의 상세 정보입니다.</p>
    </div>
  );
}

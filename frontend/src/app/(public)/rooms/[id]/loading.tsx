/**
 * Next.js loading.tsx — [id] 상세 페이지 Suspense boundary
 */
export default function RoomDetailLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[900px] mx-auto px-6 md:px-12 py-8 md:py-16 animate-pulse">
        {/* 뒤로가기 */}
        <div className="h-4 w-20 bg-muted rounded-lg mb-6" />

        {/* 이미지 영역 */}
        <div className="h-64 md:h-96 bg-muted rounded-[2rem] mb-8" />

        {/* 제목 */}
        <div className="h-10 w-48 bg-muted rounded-xl mb-3" />
        <div className="h-4 w-full bg-muted rounded-lg mb-2" />
        <div className="h-4 w-2/3 bg-muted rounded-lg mb-8" />

        {/* 스펙 테이블 */}
        <div className="rounded-[2rem] bg-muted/30 border border-border overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-border">
            <div className="h-5 w-24 bg-muted rounded" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex justify-between px-6 py-3.5 border-b border-border last:border-0">
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          ))}
        </div>

        {/* 편의시설 배지 */}
        <div className="h-5 w-20 bg-muted rounded mb-4" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-20 bg-muted rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

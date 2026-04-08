import { RoomGridSkeleton } from './_components/RoomSkeleton';

/**
 * Next.js loading.tsx — Streaming Suspense boundary
 * rooms 페이지 로딩 시 자동으로 표시됩니다.
 */
export default function RoomsLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Skeleton */}
      <div className="px-6 md:px-12 lg:px-24 pt-24 pb-4">
        <div className="mx-auto max-w-[1400px] border-b border-foreground/10 pb-8">
          <div className="h-24 w-80 bg-foreground/5 rounded-2xl animate-pulse mb-6" />
          <div className="h-6 w-64 bg-foreground/5 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Filter Chips Skeleton */}
      <div className="px-6 md:px-12 lg:px-24 py-6 md:py-8 border-b border-foreground/5">
        <div className="mx-auto max-w-[1400px] flex flex-wrap gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-full bg-foreground/5 animate-pulse border border-foreground/10"
              style={{ width: `${60 + i * 12}px` }}
            />
          ))}
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="mt-12 md:mt-24 px-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <RoomGridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}

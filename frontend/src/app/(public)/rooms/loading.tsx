import { RoomGridSkeleton } from './_components/RoomSkeleton';

/**
 * Next.js loading.tsx — Streaming Suspense boundary
 * rooms 페이지 로딩 시 자동으로 표시됩니다.
 */
export default function RoomsLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8 lg:p-16">
      {/* Header Skeleton */}
      <div className="mb-12">
        <div className="h-16 w-64 bg-[var(--color-muted)] rounded-2xl animate-pulse" />
      </div>

      {/* Filter Chips Skeleton */}
      <div className="flex flex-wrap gap-3 mb-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 rounded-full bg-[var(--color-muted)] animate-pulse"
            style={{ width: `${60 + i * 12}px` }}
          />
        ))}
      </div>

      {/* Grid Skeleton */}
      <RoomGridSkeleton count={8} />
    </div>
  );
}

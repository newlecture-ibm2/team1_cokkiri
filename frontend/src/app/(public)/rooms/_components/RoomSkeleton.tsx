export function RoomCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 rounded-[2rem] bg-[var(--color-muted)] mb-4" />
      <div className="px-1 space-y-2">
        <div className="h-5 w-2/3 bg-[var(--color-muted)] rounded-lg" />
        <div className="h-4 w-1/2 bg-[var(--color-muted)] rounded-lg" />
        <div className="h-5 w-1/3 bg-[var(--color-muted)] rounded-lg" />
      </div>
    </div>
  );
}

export function RoomGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <RoomCardSkeleton key={i} />
      ))}
    </div>
  );
}

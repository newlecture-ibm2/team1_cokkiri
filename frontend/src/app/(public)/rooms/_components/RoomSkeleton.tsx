export function RoomCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] rounded-[2rem] bg-foreground/5 mb-8" />
      <div className="px-2 space-y-3">
        <div className="flex justify-between items-baseline">
          <div className="h-6 w-2/3 bg-foreground/5 rounded-xl" />
          <div className="h-4 w-8 bg-foreground/5 rounded" />
        </div>
        <div className="border-t border-foreground/10 pt-4 flex justify-between">
          <div className="h-4 w-20 bg-foreground/5 rounded" />
          <div className="h-5 w-28 bg-foreground/5 rounded" />
        </div>
      </div>
    </div>
  );
}

export function RoomGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-24 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <RoomCardSkeleton key={i} />
      ))}
    </div>
  );
}

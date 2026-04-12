export default function NotificationsLoading() {
  return (
    <div className="animate-pulse" aria-busy aria-label="불러오는 중">
      {/* Header Skeleton */}
      <header className="mb-[clamp(2rem,5vw,5rem)]">
        <div className="flex flex-col gap-[clamp(0.75rem,1.5vw,1.5rem)]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-[clamp(1rem,2vw,2rem)] border-b border-primary/10 pb-[clamp(1rem,2vw,2rem)]">
            <div className="min-w-0 space-y-4">
              <div className="h-[clamp(1.5rem,6vw,7rem)] w-[clamp(14rem,55vw,46rem)] rounded-xl bg-primary/5" />
              <div className="h-[clamp(0.75rem,1.2vw,1.2rem)] w-[clamp(12rem,30vw,26rem)] rounded-lg bg-primary/5" />
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 gap-[clamp(0.5rem,1.5vw,2rem)] mb-[clamp(2rem,5vw,5rem)]">
        {[0, 1].map((i) => (
          <div key={i} className="p-[clamp(1.5rem,3vw,2.5rem)] bg-primary/5 border border-primary/5 rounded-[clamp(1rem,2vw,2rem)]">
            <div className="h-[clamp(1.25rem,2vw,2rem)] w-[clamp(1.25rem,2vw,2rem)] rounded-md bg-primary/5 mb-[clamp(1rem,2vw,2rem)]" />
            <div className="h-3 w-14 rounded bg-primary/5 mb-3" />
            <div className="h-[clamp(2rem,5vw,3.75rem)] w-10 rounded-lg bg-primary/5" />
          </div>
        ))}
      </div>

      {/* Filter Bar Skeleton */}
      <div className="space-y-[clamp(1.5rem,3vw,3rem)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-[clamp(1rem,2vw,2rem)] border-b border-foreground/5 pb-[clamp(1rem,2vw,2rem)]">
          <div className="flex items-center gap-[clamp(1rem,3vw,2.5rem)]">
            {[4, 5, 3, 4, 4, 3, 3].map((w, i) => (
              <div key={i} className="h-5 rounded bg-primary/5" style={{ width: `${w}rem` }} />
            ))}
          </div>
          <div className="flex items-center gap-6 self-end md:self-auto">
            <div className="h-4 w-16 rounded bg-primary/5" />
            <div className="h-4 w-12 rounded bg-primary/5" />
          </div>
        </div>

        {/* Notification Cards Skeleton */}
        <div className="grid grid-cols-1 gap-[clamp(1rem,2vw,2rem)]">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-[clamp(1rem,2vw,2rem)] p-[clamp(1.25rem,3vw,2.5rem)] bg-primary/3 border border-primary/5"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/5 shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 w-1/3 rounded bg-primary/5" />
                  <div className="h-5 w-2/3 rounded-lg bg-primary/5" />
                  <div className="h-3 w-24 rounded bg-primary/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VocsLoading() {
  return (
    <div className="animate-pulse" aria-busy aria-label="불러오는 중">
      {/* Header Skeleton */}
      <header className="mb-[clamp(2rem,5vw,5rem)]">
        <div className="flex flex-col gap-[clamp(0.75rem,1.5vw,1.5rem)]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-[clamp(1rem,2vw,2rem)] border-b border-primary/10 pb-[clamp(1rem,2vw,2rem)]">
            <div className="min-w-0 space-y-4">
              <div className="h-[clamp(1.5rem,6vw,7rem)] w-[clamp(14rem,55vw,46rem)] rounded-xl bg-primary/5" />
              <div className="h-[clamp(0.75rem,1.2vw,1.2rem)] w-[clamp(10rem,28vw,24rem)] rounded-lg bg-primary/5" />
            </div>
            <div className="h-[clamp(2.75rem,4vw,3.5rem)] w-[clamp(4rem,8vw,5.5rem)] rounded-xl bg-primary/5 shrink-0 self-end" />
          </div>
        </div>
      </header>

      {/* Form / Content Skeleton */}
      <div className="space-y-[clamp(1.5rem,3vw,3rem)]">
        <div className="space-y-6">
          <div className="h-4 w-24 rounded bg-primary/5" />
          <div className="h-14 rounded-2xl bg-primary/3 border border-primary/5" />
        </div>
        <div className="space-y-6">
          <div className="h-4 w-16 rounded bg-primary/5" />
          <div className="h-14 rounded-2xl bg-primary/3 border border-primary/5" />
        </div>
        <div className="space-y-6">
          <div className="h-4 w-20 rounded bg-primary/5" />
          <div className="h-48 rounded-2xl bg-primary/3 border border-primary/5" />
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <div className="h-12 w-24 rounded-xl bg-primary/5" />
          <div className="h-12 w-28 rounded-xl bg-primary/5" />
        </div>
      </div>
    </div>
  );
}

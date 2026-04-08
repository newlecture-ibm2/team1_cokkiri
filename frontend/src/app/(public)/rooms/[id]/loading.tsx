/**
 * Next.js loading.tsx — [id] 상세 페이지 Suspense boundary
 * 에디토리얼 레이아웃에 맞춘 스켈레톤
 */
export default function RoomDetailLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Skeleton */}
      <div className="relative h-[80vh] w-full bg-foreground/5 animate-pulse">
        <div className="absolute right-0 bottom-0 left-0 p-6 md:p-12 lg:p-24">
          <div className="mx-auto max-w-[1400px]">
            <div className="h-5 w-32 bg-white/10 rounded-lg mb-8" />
            <div className="h-20 w-3/4 bg-white/10 rounded-2xl" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="px-6 py-16 md:px-12 lg:px-24 md:py-32">
        <div className="mx-auto max-w-[1200px] animate-pulse space-y-20">
          {/* Badge */}
          <div className="h-8 w-24 bg-foreground/5 rounded-full" />

          {/* Headline */}
          <div className="space-y-4">
            <div className="h-14 w-3/4 bg-foreground/5 rounded-2xl" />
            <div className="h-6 w-full bg-foreground/5 rounded-xl" />
            <div className="h-6 w-2/3 bg-foreground/5 rounded-xl" />
          </div>

          {/* Separator */}
          <div className="h-px bg-foreground/10" />

          {/* Spec Grid */}
          <div>
            <div className="h-4 w-28 bg-foreground/5 rounded mb-12" />
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-20 bg-foreground/[0.02] border border-foreground/5 rounded-2xl" />
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-foreground/10" />

          {/* Pricing + Amenities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <div className="h-4 w-28 bg-foreground/5 rounded" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-5 w-16 bg-foreground/5 rounded" />
                  <div className="flex-1 mx-4 border-b border-dotted border-foreground/10" />
                  <div className="h-8 w-32 bg-foreground/5 rounded" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-4 w-28 bg-foreground/5 rounded" />
              <div className="flex gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-9 w-20 bg-foreground/5 rounded-full" />
                ))}
              </div>
            </div>
          </div>

          {/* CTA Card */}
          <div className="h-56 bg-foreground/5 rounded-[32px]" />
        </div>
      </div>
    </div>
  );
}

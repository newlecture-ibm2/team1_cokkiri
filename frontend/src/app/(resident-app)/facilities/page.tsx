import { Suspense } from "react";
import FacilitiesContent from "./_components/FacilitiesContent";

export default function FacilitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8 px-6 pt-16 pb-24 md:px-12 md:pt-32">
          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-muted/30 animate-pulse" />
            <div className="h-8 w-48 rounded bg-muted/30 animate-pulse" />
            <div className="h-4 w-64 rounded bg-muted/30 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-[2rem] bg-muted/30" />
            ))}
          </div>
        </div>
      }
    >
      <FacilitiesContent />
    </Suspense>
  );
}

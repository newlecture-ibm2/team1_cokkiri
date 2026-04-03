import { ScrollToTop } from "./ScrollToTop";

export function CommunityShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background py-24 md:py-32">
      <ScrollToTop />
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-12 lg:px-24">{children}</div>
    </div>
  );
}

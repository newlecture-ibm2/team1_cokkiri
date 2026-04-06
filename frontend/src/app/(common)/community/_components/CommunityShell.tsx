import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

export function CommunityShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto w-full max-w-[1400px] px-6 pt-20 md:px-12 md:pt-24 lg:px-24 lg:pt-24 pb-24 md:pb-32">
        {children}
      </main>
      <Footer />
    </div>
  );
}

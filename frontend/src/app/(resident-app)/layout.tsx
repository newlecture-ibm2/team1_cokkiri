import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

export default function ResidentAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto w-full max-w-[1400px] px-6 pt-14 md:px-12 md:pt-16 lg:px-24 lg:pt-16 pb-24 md:pb-32">
        {children}
      </main>
      <Footer />
    </div>
  );
}

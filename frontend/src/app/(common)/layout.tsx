import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { MotionEnter } from "./community/_components/MotionEnter";

/**
 * Common Layout Group (Community, VOC, Profile, Notifications)
 * Standardizes the presence of Header and Footer with consistent container constraints.
 */
export default function CommonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 w-full px-6 pt-20 md:px-12 md:pt-24 lg:px-24 lg:pt-24 pb-24 md:pb-32">
        <div className="mx-auto max-w-[1400px]">
          <MotionEnter>{children}</MotionEnter>
        </div>
      </main>
      <Footer />
    </div>
  );
}

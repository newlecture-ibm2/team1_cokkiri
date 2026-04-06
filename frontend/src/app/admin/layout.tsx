import { AdminShell } from "./_components/AdminShell";
import { Footer } from "@/components/shared/Footer";

export const metadata = {
  title: {
    template: "%s | CoKkiri Admin",
    default: "관리자",
  },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AdminShell>{children}</AdminShell>
      <Footer />
    </div>
  );
}


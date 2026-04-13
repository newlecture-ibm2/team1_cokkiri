"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminLayoutHeader } from "./AdminLayoutHeader";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AdminLayoutHeader onOpenMenu={() => setMobileMenuOpen(true)} />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <AdminSidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

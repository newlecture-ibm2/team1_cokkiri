import type { Metadata } from "next";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { manrope, pretendardVariable } from "@/lib/fonts";
import "@/styles/index.css";

import AuthProvider from "@/components/layout/AuthProvider";

export const metadata: Metadata = {
  title: "CO-LIVING PLATFORM | COKKIRI",
  description: "Next-generation IoT-based shared living experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`antialiased selection:bg-primary selection:text-primary-foreground min-h-screen ${manrope.variable} ${pretendardVariable.variable}`}
      >
        <ScrollToTop />
        <AuthProvider>
          {children}
        </AuthProvider>
        <script src="https://cdn.portone.io/v2/browser-sdk.js" defer></script>
      </body>
    </html>
  );
}

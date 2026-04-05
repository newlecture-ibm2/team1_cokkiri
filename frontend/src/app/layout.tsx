import type { Metadata } from "next";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { manrope, pretendardVariable } from "@/lib/fonts";
import "@/styles/index.css";

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
        {children}
      </body>
    </html>
  );
}

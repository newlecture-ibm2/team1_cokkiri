import type { Metadata } from "next";
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
      <body className="antialiased selection:bg-primary selection:text-primary-foreground min-h-screen">
        {children}
      </body>
    </html>
  );
}

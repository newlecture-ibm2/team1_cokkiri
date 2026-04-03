import type { Metadata } from "next";
import "../styles/index.css";
import "../styles/tailwind.css";
import "../styles/theme.css";
import "../styles/fonts.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Co-living platform",
  description: "More than just a place to stay",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}

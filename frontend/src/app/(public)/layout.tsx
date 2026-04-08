import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {/* 
        The main content wrappers should expand to at least screen height
        minus header and footer, but styling is typically handled inside `children`.
        We just provide the Header and Footer here to keep uniformity.
      */}
      <main className="flex-1 w-full flex flex-col">{children}</main>
      <Footer />
    </>
  );
}

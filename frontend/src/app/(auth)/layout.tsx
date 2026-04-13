import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
// Use Next.js Image directly if ImageWithFallback isn't available everywhere or standard img tag 
import Image from 'next/image';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Editorial Left Side */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-primary px-12 py-20 text-primary-foreground lg:flex xl:px-20">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1758448500688-3ababa93fd67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt="Interior"
            className="h-full w-full object-cover opacity-20 grayscale transition-transform duration-[20s] hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-primary/40" />
        </div>

        <div className="relative z-10">
          <Link
            href="/"
            className="group flex w-max items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] hover:text-accent transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-foreground/20 transition-all group-hover:border-accent">
              <ArrowLeft className="h-3 w-3" />
            </div>
            BACK TO HOME
          </Link>
        </div>

        <div className="relative z-10">
          <p className="mb-6 text-sm font-black uppercase tracking-[0.4em] text-accent">
            Premium Co-Living
          </p>
          <h1 className="text-[5vw] font-black leading-[0.85] tracking-tighter uppercase relative">
            <span className="block font-light italic opacity-90">Design</span>
            Your Life
            <span className="text-accent text-7xl inline-block -ml-2">.</span>
          </h1>
          <p className="mt-8 max-w-sm text-base font-medium leading-relaxed opacity-70">
            Join our curated spaces and experience a new standard of community living, blending privacy with vibrant togetherness.
          </p>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex w-full flex-col justify-center px-6 py-8 md:py-12 md:px-16 lg:w-[55%] xl:px-32 relative">
        <div className="mx-auto w-full max-w-xl">
          {children}
        </div>
      </div>
    </div>
  );
}

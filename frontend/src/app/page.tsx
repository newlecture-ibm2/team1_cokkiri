"use client";

import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="text-center space-y-8"
      >
        <h1 className="text-[10vw] font-black leading-none tracking-tighter uppercase">
          CO-LIVING
          <br />
          REDEFINED.
        </h1>
        <p className="text-xl md:text-2xl font-medium tracking-tight opacity-60">
          Sustainable living through intelligence.
        </p>
        
        <div className="pt-12">
          <div className="text-[10px] font-black tracking-[0.3em] uppercase opacity-20 mb-4 font-sans">
            Ready to Initialize
          </div>
          <div className="flex gap-4 justify-center">
            <span className="h-0.5 w-12 bg-foreground/10" />
            <span className="h-0.5 w-12 bg-foreground/10" />
            <span className="h-0.5 w-12 bg-foreground/10" />
          </div>
        </div>
      </motion.div>
    </main>
  );
}

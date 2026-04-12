"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MoveLeft, Home, LockKeyhole } from "lucide-react";

export default function ForbiddenPage() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 md:px-12 lg:px-24 py-24 selection:bg-accent selection:text-white relative overflow-hidden">
      
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full bg-accent/10 blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center relative z-10"
      >
        <div className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1">
          <motion.div variants={itemVariants} className="mb-6 flex items-center gap-4">
            <div className="h-[2px] w-12 bg-accent" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">
              Error / Status 403
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-[15vw] lg:text-[9vw] font-black tracking-tighter uppercase text-primary leading-[0.85] mb-8"
          >
            Access<br />
            <span className="text-secondary/40">Denied</span>
            <span className="text-accent">.</span>
          </motion.h1>

          <motion.div variants={itemVariants} className="max-w-md">
            <p className="text-xl md:text-2xl text-primary font-bold tracking-tight text-balance mb-4">
              접근이 제한된 구역입니다.
            </p>
            <p className="text-base text-primary/60 font-medium tracking-tight mb-12 leading-relaxed text-balance">
              이 페이지는 허가된 관리자만 사용할 수 있도록 시스템에 의해 보호되고 있습니다. 
              올바른 권한이 있는 계정으로 다시 로그인하시거나, 이전 화면으로 돌아가 주시기 바랍니다.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.back()}
              className="group flex h-14 items-center justify-center gap-3 rounded-xl border border-primary/20 bg-transparent px-8 text-sm font-black uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary/5"
            >
              <MoveLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Go Back
            </button>
            <button
              onClick={() => router.push("/")}
              className="group flex h-14 items-center justify-center gap-3 rounded-xl bg-primary px-8 text-sm font-black uppercase tracking-[0.2em] text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Home className="h-4 w-4" />
              Return Home
            </button>
          </motion.div>
        </div>

        <motion.div 
          variants={itemVariants}
          className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2"
        >
          <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80 lg:w-[420px] lg:h-[420px] rounded-[2rem] border border-secondary/20 bg-primary/5 overflow-hidden backdrop-blur-sm">
            <LockKeyhole className="w-24 h-24 md:w-32 md:h-32 text-accent/80 stroke-[1.5]" />
            
            {/* Spinning decorative borders */}
            <div className="absolute w-[140%] h-[140%] -inset-[20%] border-[2px] border-primary/10 rounded-full animate-[spin_15s_linear_infinite] border-dashed" />
            <div className="absolute w-[110%] h-[110%] -inset-[5%] border-[1px] border-accent/20 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}

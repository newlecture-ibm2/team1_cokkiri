"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MoveLeft, Home, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-6 text-foreground overflow-hidden">
      {/* Premium Grid Background */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: "radial-gradient(#2C3424 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      
      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full text-center">
        {/* Decorative Background Elements */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -top-24 pointer-events-none"
        >
          <Compass size={300} strokeWidth={0.5} className="text-primary" />
        </motion.div>

        {/* 404 Text with Animation */}
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-9xl font-bold tracking-tighter text-primary/20 sm:text-[12rem]"
        >
          404
        </motion.h1>

        {/* Main Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10 -mt-10 sm:-mt-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-balance">
            요청하신 페이지를 찾을 수 없습니다.
          </h2>
          <p className="mt-6 text-lg text-secondary leading-relaxed max-w-md mx-auto">
            서비스 이용에 불편을 드려 죄송합니다.<br />
            찾으시는 웹 페이지가 현재 사용할 수 없거나 <br className="hidden sm:block" />
            웹 페이지의 이름이 변경 또는 삭제되었습니다.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Button
            variant="outline"
            size="lg"
            className="rounded-full border-primary/20 px-8 hover:bg-surface transition-all duration-300 gap-2 h-12"
            onClick={() => router.back()}
          >
            <MoveLeft className="w-4 h-4" />
            이전페이지
          </Button>
          
          <Button
            size="lg"
            className="rounded-full bg-primary text-primary-foreground px-8 hover:opacity-90 transition-all duration-300 shadow-xl shadow-primary/10 gap-2 h-12"
            onClick={() => router.push("/")}
          >
            <Home className="w-4 h-4" />
            메인으로 가기
          </Button>
        </motion.div>

        {/* Helper Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 pt-8 border-t border-primary/10 w-full"
        >
          <p className="text-sm text-secondary/60">
            도움이 필요하신가요? <Link href="/vocs" className="underline hover:text-primary transition-colors">고객지원</Link>에 문의해 주세요.
          </p>
        </motion.div>
      </div>
    </main>
  );
}

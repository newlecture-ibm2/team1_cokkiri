"use client";

import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import ContractApplyForm from "./_components/ContractApplyForm";

/**
 * 입주 신청 페이지 (Contract Apply)
 * Moss & Aloe Editorial 무드를 반영한 대담한 레이아웃
 */
export default function ContractApplyPage() {
  return (
    <div className="text-primary">
      {/* Editorial Header Section */}
      <section className="pb-12">
        <div className="border-b-2 border-primary pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-12"
          >
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black leading-[0.85] tracking-tighter uppercase">
                CONTRACTS.
              </h1>
              <p className="max-w-xl text-lg font-medium tracking-tight opacity-70 border-l-2 border-accent pl-6 mt-8">
                코끼리 하우스는 단순한 거주 공간 이상의 가치를 지향합니다.
                당신의 새로운 라이프스타일을 위한 신청을 시작하세요.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Form Section */}
      <main className="py-12 md:py-24">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <Loader2 className="w-12 h-12 text-accent animate-spin" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase">LOADING SYSTEM...</span>
          </div>
        }>
          <ContractApplyForm />
        </Suspense>
      </main>

      {/* Background Decor */}
      <div className="fixed top-0 right-0 p-12 pointer-events-none opacity-[0.03]">
        <span className="text-[15vw] font-black uppercase leading-none select-none">COKKIRI</span>
      </div>
    </div>
  );
}

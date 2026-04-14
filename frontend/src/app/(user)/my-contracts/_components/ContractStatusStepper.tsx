"use client";

import React from "react";
import { Check, ClipboardList, Search, ThumbsUp, FileSignature, Home } from "lucide-react";
import { motion } from "framer-motion";
import { ContractStatus } from "@/types/contract"; // Assuming types exist or will be defined

interface Step {
  id: number;
  label: string;
  status: ContractStatus[];
  icon: React.ElementType;
}

const STEPS: Step[] = [
  { id: 1, label: "신청", status: ["DRAFT", "PENDING"], icon: ClipboardList },
  { id: 2, label: "서류 검토", status: ["PENDING"], icon: Search },
  { id: 3, label: "승인", status: ["APPROVED"], icon: ThumbsUp },
  { id: 4, label: "가계약", status: ["APPROVED"], icon: FileSignature },
  { id: 5, label: "확정", status: ["ACTIVE"], icon: Home },
];

interface ContractStatusStepperProps {
  currentStatus: ContractStatus;
}

export function ContractStatusStepper({ currentStatus }: ContractStatusStepperProps) {
  // Determine current active step index
  const getActiveStepIndex = () => {
    if (currentStatus === "ACTIVE") return 4;
    if (currentStatus === "APPROVED") return 3; // Approaching signature
    if (currentStatus === "PENDING") return 1; // Under review
    if (currentStatus === "DRAFT") return 0;
    return -1;
  };

  const activeIndex = getActiveStepIndex();
  const isRejected = currentStatus === "REJECTED";
  const isCancelled = currentStatus === "CANCELLED";

  if (isRejected || isCancelled) {
    return (
      <div className="flex items-center gap-4 py-4 px-6 bg-red-50 rounded-2xl border border-red-100">
        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0">
          <span className="font-black">!</span>
        </div>
        <div>
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-red-500">
            {isRejected ? "APPLICATION REJECTED" : "APPLICATION CANCELLED"}
          </p>
          <p className="text-sm font-bold text-red-900 opacity-60">
            {isRejected ? "반려 사유를 확인하고 다시 신청해 주세요." : "직접 취소하신 신청 건입니다."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <div className="relative flex justify-between">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-primary/5 -translate-y-1/2 z-0" />
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
          className="absolute top-1/2 left-0 h-[2px] bg-accent -translate-y-1/2 z-10 origin-left"
          transition={{ duration: 1, ease: "easeInOut" }}
        />

        {/* Steps */}
        {STEPS.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;
          const isPending = index > activeIndex;

          const StepIcon = step.icon;

          return (
            <div key={step.id} className="relative z-20 flex flex-col items-center gap-3">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : isPending ? 0.2 : 1,
                  opacity: isPending ? 0.3 : 1,
                  backgroundColor: isCompleted || isActive ? "var(--accent)" : "white",
                  borderColor: isCompleted || isActive ? "var(--accent)" : "var(--primary-10)",
                  color: isCompleted || isActive ? "white" : "var(--primary-20)"
                }}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all bg-background`}
                style={{
                  backgroundColor: isCompleted || isActive ? '#768064' : (isPending ? 'transparent' : '#fff'),
                  borderColor: isCompleted || isActive ? '#768064' : '#DADED8'
                }}
              >
                {!isPending && (
                  <StepIcon className="w-6 h-6 text-white" />
                )}
              </motion.div>
              <div className="text-center">
                <p className={`text-[10px] font-black tracking-[0.2em] uppercase whitespace-nowrap transition-colors ${isActive ? 'text-accent' : isCompleted ? 'text-primary' : 'text-primary/10'
                  }`}>
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Pen,
  RotateCcw,
  Loader2,
  ShieldCheck,
  FileSignature,
  CheckCircle2,
} from "lucide-react";

interface ContractSignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (signatureData: string) => Promise<void>;
  contractId: number;
  isSubmitting: boolean;
}

export function ContractSignModal({
  isOpen,
  onClose,
  onSign,
  contractId,
  isSubmitting,
}: ContractSignModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [step, setStep] = useState<"terms" | "sign">("terms");

  useEffect(() => {
    if (isOpen) {
      setStep("terms");
      setTermsAgreed(false);
      setPrivacyAgreed(false);
      setHasSignature(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === "sign" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#2C3424";
      }
    }
  }, [step]);

  const getPos = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      if ("touches" in e) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
      }
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },
    []
  );

  const startDraw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    },
    [getPos]
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasSignature(true);
    },
    [isDrawing, getPos]
  );

  const stopDraw = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }, []);

  const handleSubmit = async () => {
    if (!canvasRef.current || !hasSignature) return;
    const signatureData = canvasRef.current.toDataURL("image/png");
    await onSign(signatureData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-primary/60 backdrop-blur-md"
          onClick={!isSubmitting ? onClose : undefined}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-[640px] bg-background rounded-[2rem] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-primary/10">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-accent">
                  {step === "terms"
                    ? "STEP 01 — Terms Agreement"
                    : "STEP 02 — E-Signature"}
                </span>
                <h2 className="text-2xl font-black tracking-tighter uppercase">
                  {step === "terms"
                    ? "CONTRACT TERMS"
                    : "SIGN YOUR CONTRACT"}
                </h2>
              </div>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="p-3 hover:bg-primary/5 rounded-xl transition-colors disabled:opacity-30"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex gap-2 mt-5">
              <div
                className={`h-1 flex-1 rounded-full transition-colors ${
                  step === "terms" ? "bg-accent" : "bg-accent"
                }`}
              />
              <div
                className={`h-1 flex-1 rounded-full transition-colors ${
                  step === "sign" ? "bg-accent" : "bg-primary/10"
                }`}
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6 max-h-[65vh] overflow-y-auto">
            {step === "terms" ? (
              <div className="space-y-6">
                {/* Terms Box */}
                <div className="p-6 bg-primary/[0.03] rounded-2xl border border-primary/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-accent" />
                    <h3 className="text-sm font-black uppercase tracking-widest">
                      이용약관
                    </h3>
                  </div>
                  <div className="max-h-36 overflow-y-auto text-xs leading-relaxed opacity-70 pr-4 scrollbar-thin">
                    <p className="mb-3">
                      <strong>제1조 (목적)</strong> 본 약관은 코끼리(COKKIRI)
                      코리빙 플랫폼(이하 "서비스")의 이용에 관한 조건 및 절차,
                      권리의무관계를 규정합니다.
                    </p>
                    <p className="mb-3">
                      <strong>제2조 (계약의 체결)</strong> 입주자는 본 약관에
                      동의하고 전자서명으로 계약을 체결합니다. 계약 체결 시
                      RESIDENT 권한이 부여되며, IoT 기기 제어 및 시설 예약이
                      가능합니다.
                    </p>
                    <p className="mb-3">
                      <strong>제3조 (입주자의 의무)</strong> 입주자는
                      공용시설을 책임감 있게 사용하고, 다른 입주자의 생활을
                      존중해야 합니다. 기기 제어는 허가된 공간에서만 가능합니다.
                    </p>
                    <p className="mb-3">
                      <strong>제4조 (계약 해지)</strong> 계약 기간 만료 또는
                      관리자의 해지 절차에 따라 계약이 종료될 수 있으며, 이 경우
                      입주자 권한은 자동 회수됩니다.
                    </p>
                    <p>
                      <strong>제5조 (전자서명의 법적 효력)</strong> 본 플랫폼에서
                      수집되는 전자서명 데이터는 법적 효력을 가지며, 서버에 영구
                      보존됩니다.
                    </p>
                  </div>
                </div>

                {/* Privacy Box */}
                <div className="p-6 bg-primary/[0.03] rounded-2xl border border-primary/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <FileSignature className="w-5 h-5 text-accent" />
                    <h3 className="text-sm font-black uppercase tracking-widest">
                      개인정보 처리방침
                    </h3>
                  </div>
                  <div className="max-h-36 overflow-y-auto text-xs leading-relaxed opacity-70 pr-4 scrollbar-thin">
                    <p className="mb-3">
                      수집 항목: 서명 이미지 데이터, 동의 일시, 계약 관련 정보
                    </p>
                    <p className="mb-3">
                      수집 목적: 전자 계약 체결 확인 및 법적 증빙 보관
                    </p>
                    <p className="mb-3">
                      보유 기간: 계약 종료 후 5년 또는 관련 법령에 따른 보존 기간
                    </p>
                    <p>
                      위 개인정보 수집·이용에 동의하지 않을 권리가 있으나,
                      비동의 시 계약을 체결할 수 없습니다.
                    </p>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-4 pt-2">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        termsAgreed
                          ? "bg-accent border-accent"
                          : "border-primary/20 group-hover:border-accent/50"
                      }`}
                      onClick={() => setTermsAgreed(!termsAgreed)}
                    >
                      {termsAgreed && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span
                      className="text-sm font-bold tracking-tight"
                      onClick={() => setTermsAgreed(!termsAgreed)}
                    >
                      이용약관에 동의합니다{" "}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>

                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        privacyAgreed
                          ? "bg-accent border-accent"
                          : "border-primary/20 group-hover:border-accent/50"
                      }`}
                      onClick={() => setPrivacyAgreed(!privacyAgreed)}
                    >
                      {privacyAgreed && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span
                      className="text-sm font-bold tracking-tight"
                      onClick={() => setPrivacyAgreed(!privacyAgreed)}
                    >
                      개인정보 처리방침에 동의합니다{" "}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Signature Area */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Pen className="w-4 h-4 text-accent" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                        아래 영역에 서명하세요
                      </span>
                    </div>
                    <button
                      onClick={clearCanvas}
                      className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 rounded-xl transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </button>
                  </div>

                  <div className="relative rounded-2xl border-2 border-dashed border-primary/15 overflow-hidden bg-white">
                    <canvas
                      ref={canvasRef}
                      className="w-full cursor-crosshair touch-none"
                      style={{ height: 200 }}
                      onMouseDown={startDraw}
                      onMouseMove={draw}
                      onMouseUp={stopDraw}
                      onMouseLeave={stopDraw}
                      onTouchStart={startDraw}
                      onTouchMove={draw}
                      onTouchEnd={stopDraw}
                    />
                    {!hasSignature && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-sm text-primary/20 font-bold tracking-tight">
                          마우스 또는 터치로 서명해 주세요
                        </p>
                      </div>
                    )}
                    {/* Signature line */}
                    <div className="absolute bottom-8 left-8 right-8 border-b border-primary/10" />
                  </div>
                </div>

                {/* Legal notice */}
                <div className="p-4 bg-accent/5 rounded-xl">
                  <p className="text-[10px] font-bold tracking-tight opacity-60 leading-relaxed">
                    본 전자서명은 계약 체결의 법적 효력을 가지며, 서명 데이터는
                    서버에 영구적으로 보존됩니다. 서명 후에는 즉시 RESIDENT
                    권한이 부여되어 IoT 기기 제어 및 시설 예약이 가능해집니다.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-primary/10 flex items-center justify-between gap-4">
            {step === "terms" ? (
              <>
                <button
                  onClick={onClose}
                  className="h-14 px-8 bg-primary/5 hover:bg-primary/10 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep("sign")}
                  disabled={!termsAgreed || !privacyAgreed}
                  className="h-14 px-10 bg-accent text-white rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all hover:bg-primary disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3 shadow-xl shadow-accent/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Proceed to Sign
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep("terms")}
                  disabled={isSubmitting}
                  className="h-14 px-8 bg-primary/5 hover:bg-primary/10 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-colors disabled:opacity-30"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!hasSignature || isSubmitting}
                  className="h-14 px-10 bg-accent text-white rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all hover:bg-primary disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3 shadow-xl shadow-accent/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileSignature className="w-4 h-4" />
                      Sign & Activate
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

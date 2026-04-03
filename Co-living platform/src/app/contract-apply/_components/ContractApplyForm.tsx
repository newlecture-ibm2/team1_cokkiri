"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Send,
  Loader2,
  Clock
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ContractFormData {
  desiredStartDate: string;
  desiredDurationMonths: number;
  usagePurpose: string;
  requestNote: string;
  privacyAgreed: boolean;
  termsAgreed: boolean;
}

const INITIAL_DATA: ContractFormData = {
  desiredStartDate: "",
  desiredDurationMonths: 6,
  usagePurpose: "",
  requestNote: "",
  privacyAgreed: false,
  termsAgreed: false,
};

export default function ContractApplyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spaceId = searchParams.get("spaceId") || "1"; // Default to 1 for demo

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ContractFormData>(INITIAL_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load draft from LocalStorage on mount (as fallback or initial recovery)
  useEffect(() => {
    const savedDraft = localStorage.getItem(`contract_draft_${spaceId}`);
    if (savedDraft) {
      try {
        setFormData(JSON.parse(savedDraft));
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, [spaceId]);

  // Throttled Draft Save API Call
  const saveDraft = useCallback(async (data: ContractFormData) => {
    setIsSaving(true);
    try {
      await fetch('/api/v1/contracts/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, spaceId: Number(spaceId) })
      });
      
      localStorage.setItem(`contract_draft_${spaceId}`, JSON.stringify(data));
      setLastSaved(new Date());
    } catch (err) {
      console.error("Draft save failed", err);
    } finally {
      setIsSaving(false);
    }
  }, [spaceId]);

  // Throttling logic using useEffect
  useEffect(() => {
    if (step > 3) return;
    
    const handler = setTimeout(() => {
      saveDraft(formData);
    }, 2000);

    return () => clearTimeout(handler);
  }, [formData, saveDraft, step]);

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.privacyAgreed || !formData.termsAgreed) {
      setError("모든 필수 약관에 동의해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/contracts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, spaceId: Number(spaceId) })
      });

      if (!response.ok) throw new Error("Submission failed");
      
      localStorage.removeItem(`contract_draft_${spaceId}`);
      setStep(4);
    } catch (err) {
      setError("신청 도중 오류가 발생했습니다. 모든 필드를 올바르게 입력했는지 확인해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-slate-100">
      {/* Header & Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {step < 4 ? <FileText className="w-6 h-6 text-indigo-600" /> : <CheckCircle2 className="w-6 h-6 text-green-500" />}
            {step === 4 ? "신청 완료" : "계약 신청하기"}
          </h2>
          {step < 4 && (
            <div className="flex items-center text-xs font-medium text-slate-400 gap-2">
              {isSaving ? (
                <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> 저장 중...</span>
              ) : lastSaved ? (
                <span className="flex items-center gap-1 text-indigo-500"><Save className="w-3 h-3"/> {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 저장됨</span>
              ) : (
                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> 실시간 저장 중</span>
              )}
            </div>
          )}
        </div>
        
        {step < 4 && (
          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="absolute left-0 top-0 h-full bg-indigo-600"
              initial={{ width: "33%" }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-indigo-500" /> 희망 입주 예정일
                </label>
                <input
                  type="date"
                  name="desiredStartDate"
                  value={formData.desiredStartDate}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <p className="text-xs text-slate-400">* 입주 가능일은 관리자 승인 시 확정됩니다.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">희망 거주 기간 (개월)</label>
                <select
                  name="desiredDurationMonths"
                  value={formData.desiredDurationMonths}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  {[3, 6, 12, 24].map(m => (
                    <option key={m} value={m}>{m}개월</option>
                  ))}
                </select>
              </div>

              <button 
                type="button" 
                onClick={nextStep}
                disabled={!formData.desiredStartDate}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음 단계로 <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">사용 목적</label>
                <input
                  type="text"
                  name="usagePurpose"
                  value={formData.usagePurpose}
                  onChange={handleInputChange}
                  placeholder="예: 학업, 직장 출퇴근용, 한달 살기 등"
                  className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">추가 요청 사항</label>
                <textarea
                  name="requestNote"
                  value={formData.requestNote}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="관리자에게 전달하고 싶은 내용을 입력해주세요."
                  className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="py-4 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-all flex justify-center items-center gap-2 group"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 이전
                </button>
                <button 
                  type="button" 
                  onClick={nextStep}
                  className="py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 group"
                >
                  다음 단계로 <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">주의문구 동의</h3>
                
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-3">
                  <div className="flex gap-2 text-amber-700">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">신청 전 다음 내용을 반드시 확인해주세요.</p>
                  </div>
                  <ul className="text-xs text-amber-800 space-y-1 list-disc pl-4 opacity-80">
                    <li>입주 확정은 심사 후 최종 계약서 작성 시 완료됩니다.</li>
                    <li>승인 후 24시간 내에 답변이 없을 경우 신청이 취소될 수 있습니다.</li>
                    <li>신청 정보가 허위일 경우 입주가 불가할 수 있습니다.</li>
                  </ul>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
                    <input 
                      type="checkbox" 
                      name="privacyAgreed" 
                      checked={formData.privacyAgreed}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" 
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                      개인정보 수집 및 이용에 동의합니다. <span className="text-rose-500 font-bold">(필수)</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
                    <input 
                      type="checkbox" 
                      name="termsAgreed" 
                      checked={formData.termsAgreed}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" 
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                      코리빙 입주 주의사항을 모두 확인하였습니다. <span className="text-rose-500 font-bold">(필수)</span>
                    </span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="py-4 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-all flex justify-center items-center gap-2 group"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 이전
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 group disabled:bg-slate-400"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>최종 신청 제출 <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center text-center space-y-6"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">계약 신청이 접수되었습니다!</h3>
                <p className="text-slate-500">
                  담당 매니저가 심사 후 1~2일 내로 연락드릴 예정입니다.<br/>
                  진행 현황은 마이페이지에서 확인하실 수 있습니다.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => router.push("/my-contracts")}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
              >
                신청 내역 확인하러 가기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

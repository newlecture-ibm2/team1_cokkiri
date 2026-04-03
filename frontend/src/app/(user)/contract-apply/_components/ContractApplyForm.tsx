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
  Clock,
  Home,
  CreditCard,
  User,
  ShieldCheck,
  Building
} from "lucide-react";
import Link from "next/link";

interface ContractFormData {
  desiredStartDate: string;
  desiredDurationMonths: number;
  usagePurpose: string;
  requestNote: string;
  address: string;
  bankAccount: string;
  privacyAgreed: boolean;
  termsAgreed: boolean;
}

const INITIAL_DATA: ContractFormData = {
  desiredStartDate: "",
  desiredDurationMonths: 6,
  usagePurpose: "",
  requestNote: "",
  address: "",
  bankAccount: "",
  privacyAgreed: false,
  termsAgreed: false,
};

export default function ContractApplyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spaceId = searchParams.get("spaceId") || "1"; 

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ContractFormData>(INITIAL_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load draft from LocalStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem(`contract_draft_${spaceId}`);
    if (savedDraft) {
      try {
        setFormData(prev => ({ ...prev, ...JSON.parse(savedDraft) }));
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, [spaceId]);

  // Throttled Draft Save API Call
  const saveDraft = useCallback(async (data: ContractFormData) => {
    setIsSaving(true);
    try {
      await fetch('/api/bff/contracts/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, spaceId: Number(spaceId) })
      }).catch(err => console.warn("API Draft save error, check backend."));
      
      localStorage.setItem(`contract_draft_${spaceId}`, JSON.stringify(data));
      setLastSaved(new Date());
    } catch (err) {
      console.error("Draft save failed", err);
    } finally {
      setIsSaving(false);
    }
  }, [spaceId]);

  useEffect(() => {
    if (step > 4) return;
    const handler = setTimeout(() => {
      saveDraft(formData);
    }, 2000);
    return () => clearTimeout(handler);
  }, [formData, saveDraft, step]);

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
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
      const response = await fetch('/api/bff/contracts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          spaceId: Number(spaceId),
          desiredStartDate: formData.desiredStartDate,
          desiredDurationMonths: Number(formData.desiredDurationMonths),
          usagePurpose: formData.usagePurpose,
          requestNote: formData.requestNote,
          address: formData.address,
          bankAccount: formData.bankAccount,
          privacyAgreed: formData.privacyAgreed
        })
      });

      if (!response.ok) throw new Error("Submission failed");
      
      localStorage.removeItem(`contract_draft_${spaceId}`);
      setStep(5);
    } catch (err) {
      setError("신청 도중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { title: "SCHEDULE", icon: Calendar },
    { title: "DETAILS", icon: Home },
    { title: "PAYMENT", icon: CreditCard },
    { title: "AGREEMENT", icon: ShieldCheck }
  ];

  return (
    <div className="max-w-[900px] mx-auto">
      {/* Editorial Step Tracker */}
      {step < 5 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
          <div className="flex items-center gap-10 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <span className={`text-[10px] font-black tracking-[0.3em] transition-colors ${
                  step >= i + 1 ? "text-primary" : "text-primary/20"
                }`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={`text-[10px] font-black tracking-[0.2em] transition-all whitespace-nowrap ${
                  step === i + 1 ? "text-accent" : "text-primary/10"
                }`}>
                  {s.title}
                </span>
                {i < steps.length - 1 && (
                  <div className={`w-8 h-[1px] ${step > i + 1 ? "bg-accent" : "bg-primary/5"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-[10px] font-black tracking-[0.3em] uppercase opacity-40">
            {isSaving ? (
              <span className="flex items-center gap-2 text-accent animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin"/> SAVING...
              </span>
            ) : lastSaved && (
              <span className="flex items-center gap-2">
                <Save className="w-3 h-3"/> SYNCED
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white rounded-[3rem] border border-primary/5 shadow-2xl shadow-primary/5 p-10 md:p-20 relative overflow-hidden">
        {/* Editorial Background Element */}
        {step < 5 && (
          <span className="absolute -top-10 -right-10 text-[20vw] font-black text-primary/[0.02] select-none pointer-events-none">
            {String(step).padStart(2, '0')}
          </span>
        )}

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-12"
              >
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">STEP 01</span>
                  <h2 className="text-5xl font-black text-primary tracking-tighter uppercase leading-[0.85]">
                    SELECT YOUR<br />SCHEDULE
                  </h2>
                  <p className="text-lg font-medium tracking-tight opacity-50 max-w-md">
                    코끼리 하우스에서의 생활이 시작되는 시점과 기간을 선택해주세요.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black tracking-[0.3em] uppercase text-primary/40 block">
                      START DATE
                    </label>
                    <input
                      type="date"
                      name="desiredStartDate"
                      value={formData.desiredStartDate}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-primary/5 border-none p-6 rounded-2xl text-lg font-bold focus:ring-2 focus:ring-accent transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black tracking-[0.3em] uppercase text-primary/40 block">
                      DURATION (MONTHS)
                    </label>
                    <select
                      name="desiredDurationMonths"
                      value={formData.desiredDurationMonths}
                      onChange={handleInputChange}
                      className="w-full bg-primary/5 border-none p-6 rounded-2xl text-lg font-bold focus:ring-2 focus:ring-accent transition-all appearance-none"
                    >
                      {[3, 6, 12, 24].map(m => (
                        <option key={m} value={m}>{m} MONTHS</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!formData.desiredStartDate}
                  className="w-full py-8 bg-primary hover:bg-accent text-background rounded-full font-black tracking-[0.2em] transition-all flex justify-center items-center gap-4 disabled:opacity-20"
                >
                  PROCEED TO DETAILS <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">STEP 02</span>
                  <h2 className="text-5xl font-black text-primary tracking-tighter uppercase leading-[0.85]">
                    RESIDENT<br />PROFILE
                  </h2>
                  <p className="text-lg font-medium tracking-tight opacity-50">
                    우리는 거주자 한 분 한 분의 이야기를 소중히 생각합니다.
                  </p>
                </div>

                <div className="space-y-10 pt-4">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black tracking-[0.3em] uppercase text-primary/40 block">
                      CURRENT ADDRESS
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="심사용 서류에 기재될 현재 주소를 입력하세요."
                      className="w-full bg-primary/5 border-none p-6 rounded-2xl text-lg font-bold focus:ring-2 focus:ring-accent transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black tracking-[0.3em] uppercase text-primary/40 block">
                      USAGE PURPOSE
                    </label>
                    <input
                      type="text"
                      name="usagePurpose"
                      value={formData.usagePurpose}
                      onChange={handleInputChange}
                      placeholder="입주 목적을 간단히 적어주세요."
                      className="w-full bg-primary/5 border-none p-6 rounded-2xl text-lg font-bold focus:ring-2 focus:ring-accent transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black tracking-[0.3em] uppercase text-primary/40 block">
                      ADDITIONAL NOTES
                    </label>
                    <textarea
                      name="requestNote"
                      value={formData.requestNote}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full bg-primary/5 border-none p-6 rounded-2xl text-lg font-bold focus:ring-2 focus:ring-accent transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button type="button" onClick={prevStep} className="py-8 border-2 border-primary/10 text-primary rounded-full font-black tracking-[0.2em] transition-all hover:bg-primary/5">
                    GO BACK
                  </button>
                  <button type="button" onClick={nextStep} className="py-8 bg-primary hover:bg-accent text-background rounded-full font-black tracking-[0.2em] transition-all">
                    NEXT STEP
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
                className="space-y-12"
              >
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">STEP 03</span>
                  <h2 className="text-5xl font-black text-primary tracking-tighter uppercase leading-[0.85]">
                    BILLING &<br />REFUND
                  </h2>
                </div>

                <div className="p-8 bg-primary/5 rounded-[2rem] border-l-4 border-accent space-y-4">
                  <p className="text-sm font-bold tracking-tight opacity-70">
                    입력하신 계좌 정보는 입주 심사 승인 및 계약 진행 시 대조용으로 활용되며, 
                    퇴거 시 보증금 반환 계좌로 우선 사용됩니다.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black tracking-[0.3em] uppercase text-primary/40 block">
                    BANK ACCOUNT INFO
                  </label>
                  <input
                    type="text"
                    name="bankAccount"
                    value={formData.bankAccount}
                    onChange={handleInputChange}
                    placeholder="은행명 및 계좌번호를 입력하세요."
                    className="w-full bg-primary/5 border-none p-6 rounded-2xl text-lg font-bold focus:ring-2 focus:ring-accent transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button type="button" onClick={prevStep} className="py-8 border-2 border-primary/10 text-primary rounded-full font-black tracking-[0.2em] transition-all hover:bg-primary/5">
                    GO BACK
                  </button>
                  <button type="button" onClick={nextStep} disabled={!formData.bankAccount} className="py-8 bg-primary hover:bg-accent text-background rounded-full font-black tracking-[0.2em] transition-all disabled:opacity-20">
                    NEXT STEP
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">FINAL STEP</span>
                  <h2 className="text-5xl font-black text-primary tracking-tighter uppercase leading-[0.85]">
                    REVIEW &<br />SUBMIT
                  </h2>
                </div>

                <div className="space-y-4 pt-4">
                  <label className="flex items-center gap-6 p-8 bg-primary/5 rounded-[2rem] cursor-pointer group transition-all hover:bg-primary/10">
                    <input 
                      type="checkbox" 
                      name="privacyAgreed" 
                      checked={formData.privacyAgreed}
                      onChange={handleInputChange}
                      className="w-8 h-8 rounded-full border-primary/20 text-accent focus:ring-0" 
                    />
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase">개인정보 수집 및 이용 동의 (필수)</span>
                  </label>
                  <label className="flex items-center gap-6 p-8 bg-primary/5 rounded-[2rem] cursor-pointer group transition-all hover:bg-primary/10">
                    <input 
                      type="checkbox" 
                      name="termsAgreed" 
                      checked={formData.termsAgreed}
                      onChange={handleInputChange}
                      className="w-8 h-8 rounded-full border-primary/20 text-accent focus:ring-0" 
                    />
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase">주의사항 확인 및 입주 서약 (필수)</span>
                  </label>
                </div>

                {error && (
                  <div className="p-6 bg-rose-50 text-rose-600 text-[10px] font-black tracking-[0.2em] rounded-2xl flex items-center gap-4">
                    <AlertCircle className="w-5 h-5" /> {error.toUpperCase()}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button type="button" onClick={prevStep} className="py-8 border-2 border-primary/10 text-primary rounded-full font-black tracking-[0.2em] transition-all hover:bg-primary/5">
                    GO BACK
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting || !formData.privacyAgreed || !formData.termsAgreed}
                    className="py-8 bg-primary text-background rounded-full font-black tracking-[0.2em] flex justify-center items-center gap-4 hover:bg-accent transition-all disabled:opacity-20"
                  >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>SUBMIT APPLICATION <Send className="w-5 h-5" /></>}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-20 flex flex-col items-center text-center space-y-12"
              >
                <div className="w-40 h-40 bg-accent/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-20 h-20 text-accent" />
                </div>
                
                <div className="space-y-6">
                  <h2 className="text-5xl font-black text-primary tracking-tighter uppercase leading-[0.85]">
                    SUCCESSFULLY<br />SUBMITTED
                  </h2>
                  <p className="text-xl font-medium tracking-tight opacity-50 max-w-sm mx-auto whitespace-pre-wrap">
                    심사 결과는 1-2일 내로 전달됩니다.{"\n"}대시보드에서 상태를 확인하세요.
                  </p>
                </div>

                <Link 
                  href="/my-contracts"
                  className="px-16 py-8 bg-primary text-background rounded-full font-black tracking-[0.2em] uppercase transition-all hover:scale-105 shadow-2xl shadow-primary/20"
                >
                  GO TO DASHBOARD
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}


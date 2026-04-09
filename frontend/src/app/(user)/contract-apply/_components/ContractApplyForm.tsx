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
  contractId?: number;
  desiredStartDate: string;
  desiredDurationMonths: number;
  usagePurpose: string;
  requestNote: string;
  address: string;
  bankAccount: string;
  privacyAgreed: boolean;
  termsAgreed: boolean;
  status?: string;
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
  status: "DRAFT",
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
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isReadOnly = formData.status === "ACTIVE" || formData.status === "EXPIRED" || formData.status === "TERMINATED" || formData.status === "APPROVED";


  // Load draft from API & LocalStorage
  useEffect(() => {
    const loadDraft = async () => {
      setIsLoading(true);
      setFormData(INITIAL_DATA); // Reset to clean state first

      const contractId = searchParams.get("id");
      try {
        // 1. Try LocalStorage first for instant hit (only if no specific contractId)
        if (!contractId) {
          const savedDraft = localStorage.getItem(`contract_draft_${spaceId}`);
          if (savedDraft) {
            setFormData(prev => ({ ...prev, ...JSON.parse(savedDraft) }));
          }
        }

        // 2. Fetch from Server for latest truth
        const url = contractId 
          ? `/api/contracts/${contractId}`
          : `/api/contracts/draft?spaceId=${spaceId}`;

        const response = await fetch(url);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setFormData(prev => ({
              ...INITIAL_DATA, // Use INITIAL_DATA as base for server results
              contractId: result.data.contractId,
              desiredStartDate: result.data.desiredStartDate || INITIAL_DATA.desiredStartDate,
              desiredDurationMonths: result.data.desiredDurationMonths || INITIAL_DATA.desiredDurationMonths,
              address: result.data.address || INITIAL_DATA.address,
              bankAccount: result.data.bankAccount || INITIAL_DATA.bankAccount,
              usagePurpose: result.data.usagePurpose || INITIAL_DATA.usagePurpose,
              requestNote: result.data.requestNote || INITIAL_DATA.requestNote,
              privacyAgreed: result.data.privacyAgreed || INITIAL_DATA.privacyAgreed,
              termsAgreed: result.data.status !== "DRAFT",
              status: result.data.status || "DRAFT",
            }));
          }
        }
      } catch (e) {
        console.error("Failed to load draft from server", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadDraft();
  }, [spaceId, searchParams]);

  // Throttled Draft Save API Call
  const saveDraft = useCallback(async (data: ContractFormData, isManual: boolean = false) => {
    if (isManual) setIsSaving(true);
    try {
      await fetch('/api/contracts/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, spaceId: Number(spaceId), contractId: data.contractId })
      }).catch(err => console.warn("API Draft save error, check backend."));
      
      localStorage.setItem(`contract_draft_${spaceId}`, JSON.stringify(data));
      setLastSaved(new Date());
      
      if (isManual) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      console.error("Draft save failed", err);
    } finally {
      if (isManual) setIsSaving(false);
    }
  }, [spaceId]);

  // Throttled Auto-save
  useEffect(() => {
    if (step > 4 || isLoading) return;
    const handler = setTimeout(() => {
      saveDraft(formData, false);
    }, 2000);
    return () => clearTimeout(handler);
  }, [formData, saveDraft, step, isLoading]);

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
      const response = await fetch('/api/contracts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contractId: formData.contractId,
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
          {formData.status !== "DRAFT" && (
            <div className="flex items-center gap-4 px-6 py-3 bg-accent/10 border border-accent/20 rounded-full">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span className="text-[10px] font-black tracking-[0.2em] text-accent uppercase">
                {isReadOnly ? "FINALIZED SUBMISSION" : "VIEWING/EDITING SUBMISSION"} - {formData.status}
              </span>
            </div>
          )}
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
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative">
        <div className="bg-white rounded-[3rem] border border-primary/5 shadow-2xl shadow-primary/5 p-10 md:p-20 relative overflow-hidden">
          {/* Top Right Save & Exit Buttons */}
          {step < 5 && (
            <div className="absolute top-8 right-8 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center gap-2 px-6 py-3 bg-primary/5 hover:bg-rose-500 hover:text-white rounded-full text-[10px] font-black tracking-[0.2em] uppercase transition-all"
              >
                CLOSE
              </button>
              {!isReadOnly && (
                <button 
                  type="button"
                  onClick={() => saveDraft(formData, true)}
                  disabled={isSaving || isLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-primary/5 hover:bg-accent hover:text-white rounded-full text-[10px] font-black tracking-[0.2em] uppercase transition-all group disabled:opacity-50"
                >
                  {(isSaving || isLoading) ? (
                    <Loader2 className="w-3 h-3 animate-spin"/>
                  ) : (
                    <Save className="w-3 h-3 transition-transform group-hover:scale-110" />
                  )}
                  {isLoading ? "LOADING..." : "SAVE DRAFT"}
                </button>
              )}
            </div>
          )}

          {/* Editorial Background Element */}
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
                      disabled={isReadOnly}
                      className="w-full bg-primary/5 border-none p-6 rounded-2xl text-lg font-bold focus:ring-2 focus:ring-accent transition-all disabled:opacity-50"
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
                      disabled={isReadOnly}
                      className="w-full bg-primary/5 border-none p-6 rounded-2xl text-lg font-bold focus:ring-2 focus:ring-accent transition-all appearance-none disabled:opacity-50"
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
                      disabled={isReadOnly}
                      placeholder="심사용 서류에 기재될 현재 주소를 입력하세요."
                      className="w-full bg-primary/5 border-none p-6 rounded-2xl text-lg font-bold focus:ring-2 focus:ring-accent transition-all disabled:opacity-50"
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
                      disabled={isReadOnly}
                      placeholder="입주 목적을 간단히 적어주세요."
                      className="w-full bg-primary/5 border-none p-6 rounded-2xl text-lg font-bold focus:ring-2 focus:ring-accent transition-all disabled:opacity-50"
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
                      disabled={isReadOnly}
                      className="w-full bg-primary/5 border-none p-6 rounded-2xl text-lg font-bold focus:ring-2 focus:ring-accent transition-all resize-none disabled:opacity-50"
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
                    disabled={isReadOnly}
                    placeholder="은행명 및 계좌번호를 입력하세요."
                    className="w-full bg-primary/5 border-none p-6 rounded-2xl text-lg font-bold focus:ring-2 focus:ring-accent transition-all disabled:opacity-50"
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
                      disabled={isReadOnly}
                      className="w-8 h-8 rounded-full border-primary/20 text-accent focus:ring-0 disabled:opacity-50" 
                    />
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase">개인정보 수집 및 이용 동의 (필수)</span>
                  </label>
                  <label className="flex items-center gap-6 p-8 bg-primary/5 rounded-[2rem] cursor-pointer group transition-all hover:bg-primary/10">
                    <input 
                      type="checkbox" 
                      name="termsAgreed" 
                      checked={formData.termsAgreed}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                      className="w-8 h-8 rounded-full border-primary/20 text-accent focus:ring-0 disabled:opacity-50" 
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
                    disabled={isReadOnly || isSubmitting || !formData.privacyAgreed || !formData.termsAgreed}
                    className="py-8 bg-primary text-background rounded-full font-black tracking-[0.2em] flex justify-center items-center gap-4 hover:bg-accent transition-all disabled:opacity-20"
                  >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 
                     isReadOnly ? <><ShieldCheck className="w-5 h-5" /> ALREADY SUBMITTED</> : 
                     <>SUBMIT APPLICATION <Send className="w-5 h-5" /></>}
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

      {/* Premium Toast Component */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className="bg-primary text-background px-10 py-5 rounded-full shadow-2xl flex items-center gap-6 border-2 border-white/10">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <Save className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col pr-6">
                <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40 leading-none mb-1">DRAFT SYNCED</span>
                <span className="text-sm font-bold tracking-tight">계약서 신청 내용이 임시 저장되었습니다.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


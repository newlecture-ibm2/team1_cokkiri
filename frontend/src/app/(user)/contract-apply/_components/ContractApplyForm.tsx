"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as PortOne from "@portone/browser-sdk/v2";
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

// ── Bank format definitions ────────────────────────────────
interface BankFormat {
  label: string;
  groups: number[];   // digit groups, e.g. [3,2,6] → 000-00-000000
  totalDigits: number;
}

const BANK_FORMATS: Record<string, BankFormat> = {
  "국민": { label: "국민은행", groups: [3, 2, 4, 3, 2], totalDigits: 14 },
  "신한": { label: "신한은행", groups: [3, 3, 6],        totalDigits: 12 },
  "하나": { label: "하나은행", groups: [3, 6, 5],        totalDigits: 14 },
  "우리": { label: "우리은행", groups: [4, 3, 6],        totalDigits: 13 },
  "농협": { label: "농협은행", groups: [3, 4, 4, 2],     totalDigits: 13 },
  "기업": { label: "IBK기업은행", groups: [3, 6, 2, 3],  totalDigits: 14 },
  "SC":   { label: "SC제일은행", groups: [3, 2, 6],      totalDigits: 11 },
  "카카오": { label: "카카오뱅크", groups: [4, 2, 7],     totalDigits: 13 },
  "토스":  { label: "토스뱅크", groups: [4, 4, 4],        totalDigits: 12 },
  "케이": { label: "케이뱅크", groups: [3, 3, 6],        totalDigits: 12 },
  "수협": { label: "수협은행", groups: [3, 2, 6, 2],     totalDigits: 13 },
  "대구": { label: "대구은행", groups: [3, 2, 6, 1],     totalDigits: 12 },
  "부산": { label: "부산은행", groups: [3, 4, 4, 2],     totalDigits: 13 },
  "광주": { label: "광주은행", groups: [3, 3, 6],        totalDigits: 12 },
  "전북": { label: "전북은행", groups: [3, 2, 6, 2],     totalDigits: 13 },
  "경남": { label: "경남은행", groups: [3, 4, 4, 2],     totalDigits: 13 },
  "제주": { label: "제주은행", groups: [3, 2, 6],        totalDigits: 11 },
  "산업": { label: "KDB산업은행", groups: [3, 6, 2, 3],  totalDigits: 14 },
  "우체국": { label: "우체국", groups: [6, 2, 6],        totalDigits: 14 },
  "씨티": { label: "한국씨티은행", groups: [3, 6, 3],    totalDigits: 12 },
};

const BANK_LIST = Object.entries(BANK_FORMATS).map(([key, fmt]) => ({
  key,
  label: fmt.label,
}));

/** Format raw digits according to bank group pattern */
function formatAccountNumber(digits: string, groups: number[]): string {
  let result = "";
  let idx = 0;
  for (let i = 0; i < groups.length; i++) {
    const chunk = digits.slice(idx, idx + groups[i]);
    if (!chunk) break;
    result += (i > 0 ? "-" : "") + chunk;
    idx += groups[i];
  }
  return result;
}

/** Strip non-digits from input */
function stripNonDigits(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

interface ContractFormData {
  contractId?: number;
  desiredStartDate: string;
  desiredDurationMonths: number;
  usagePurpose: string;
  requestNote: string;
  address: string;
  bankName: string;
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
  bankName: "",
  bankAccount: "",
  privacyAgreed: false,
  termsAgreed: false,
  status: "DRAFT",
};

export default function ContractApplyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spaceId = searchParams.get("spaceId") || "1";
  const minStartDate = searchParams.get("minStartDate") || ""; // 사전 예약 시 계약 종료일 이후만 선택 가능

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ContractFormData>(INITIAL_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [bankAccountError, setBankAccountError] = useState<string | null>(null);
  const [bankAccountTouched, setBankAccountTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{
    name?: string; phone?: string; email?: string;
    gender?: string; nationality?: string; birthDate?: string;
  } | null>(null);
  const isReadOnly = formData.status === "ACTIVE" || formData.status === "EXPIRED" || formData.status === "TERMINATED" || formData.status === "APPROVED";

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer" | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [virtualAccount, setVirtualAccount] = useState<{ bank: string; account: string; holder: string } | null>(null);
  const [portonePaymentId, setPortonePaymentId] = useState<string | null>(null);
  const [roomDeposit, setRoomDeposit] = useState<number>(0); // 방 보증금(결제 금액)

  // PortOne card payment handler
  const handlePortoneCardPayment = async () => {
    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
    const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

    if (!storeId || !channelKey) {
      alert("결제 설정이 완료되지 않았습니다. 관리자에게 문의하세요.");
      return;
    }

    setIsPaymentProcessing(true);
    try {
      const paymentId = `deposit-${spaceId}-${Date.now()}`;
      const response = await PortOne.requestPayment({
        storeId,
        channelKey,
        paymentId,
        orderName: `코끼리 보증금 - Room ${spaceId}`,
        totalAmount: roomDeposit || 1000,
        currency: "CURRENCY_KRW",
        payMethod: "CARD",
      });

      if (response && !response.code) {
        // 결제 성공
        setPortonePaymentId(paymentId);
        setPaymentComplete(true);
      } else {
        // 결제 실패 또는 취소
        alert(response?.message || "결제가 취소되었거나 실패했습니다.");
      }
    } catch (err: any) {
      alert(err.message || "결제 처리 중 오류가 발생했습니다.");
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' });
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data) {
            setUserProfile(result.data);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch user profile', e);
      }
    };
    fetchProfile();
  }, []);

  // Fetch room data for deposit amount
  useEffect(() => {
    const fetchRoomDeposit = async () => {
      try {
        const res = await fetch(`/api/rooms/${spaceId}`, { credentials: 'include' });
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data) {
            setRoomDeposit(result.data.deposit || 0);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch room deposit', e);
      }
    };
    fetchRoomDeposit();
  }, [spaceId]);


  // Load draft from API & LocalStorage
  useEffect(() => {
    const loadDraft = async () => {
      setIsLoading(true);
      setFormData(INITIAL_DATA); // Reset to clean state first

      const contractId = searchParams.get("id");
      try {
        // 1. Fetch from Server for latest truth (server is the authority)
        const url = contractId
          ? `/api/contracts/${contractId}`
          : `/api/contracts/draft?spaceId=${spaceId}`;

        const response = await fetch(url, { credentials: 'include' });
        let serverHasData = false;

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            serverHasData = true;
            // Parse bankAccount from server ("국민은행 123-45-678901" → bankName + digits)
            let loadedBankName = INITIAL_DATA.bankName;
            let loadedBankAccount = result.data.bankAccount || INITIAL_DATA.bankAccount;
            if (result.data.bankAccount) {
              const ba = result.data.bankAccount as string;
              const matchedBank = BANK_LIST.find(b => ba.startsWith(b.label));
              if (matchedBank) {
                loadedBankName = matchedBank.key;
                loadedBankAccount = stripNonDigits(ba.replace(matchedBank.label, "").trim());
              }
            }
            setFormData({
              ...INITIAL_DATA,
              contractId: result.data.contractId,
              desiredStartDate: result.data.desiredStartDate || INITIAL_DATA.desiredStartDate,
              desiredDurationMonths: result.data.desiredDurationMonths || INITIAL_DATA.desiredDurationMonths,
              address: result.data.address || INITIAL_DATA.address,
              bankName: loadedBankName,
              bankAccount: loadedBankAccount,
              usagePurpose: result.data.usagePurpose || INITIAL_DATA.usagePurpose,
              requestNote: result.data.requestNote || INITIAL_DATA.requestNote,
              privacyAgreed: result.data.privacyAgreed || INITIAL_DATA.privacyAgreed,
              termsAgreed: result.data.status !== "DRAFT",
              status: result.data.status || "DRAFT",
            });
          }
        }

        // 2. If server has no draft, try LocalStorage only for NEW drafts (no contractId)
        if (!serverHasData && !contractId) {
          const savedDraft = localStorage.getItem(`contract_draft_${spaceId}`);
          if (savedDraft) {
            const parsed = JSON.parse(savedDraft);
            // Only restore localStorage data if it's genuinely a DRAFT (not leftover from a submitted contract)
            if (!parsed.status || parsed.status === "DRAFT") {
              setFormData(prev => ({ ...prev, ...parsed }));
            } else {
              // Stale localStorage from a previous submission — clear it
              localStorage.removeItem(`contract_draft_${spaceId}`);
            }
          }
        }

        // 3. If server explicitly has no draft and no localStorage hit, ensure clean state
        if (!serverHasData && !contractId) {
          // Clear any stale localStorage for this space (previous contracts)
          const savedDraft = localStorage.getItem(`contract_draft_${spaceId}`);
          if (savedDraft) {
            const parsed = JSON.parse(savedDraft);
            if (parsed.status && parsed.status !== "DRAFT") {
              localStorage.removeItem(`contract_draft_${spaceId}`);
            }
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
      // Create a copy to modify for the request
      const requestData = {
        ...data,
        spaceId: Number(spaceId),
        // Convert empty strings to null for backend date parsing
        desiredStartDate: data.desiredStartDate === "" ? null : data.desiredStartDate,
      };

      const res = await fetch('/api/contracts/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });

      if (res.ok) {
        const result = await res.json();
        // Update contractId if it was newly created on the server
        if (result.success && result.data && !data.contractId) {
          setFormData(prev => ({ ...prev, contractId: result.data }));
        }
        
        localStorage.setItem(`contract_draft_${spaceId}`, JSON.stringify(data));
        setLastSaved(new Date());

        if (isManual) {
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }
      } else {
        console.warn("API Draft save error: ", res.status);
      }
    } catch (err) {
      console.error("Draft save failed", err);
    } finally {
      if (isManual) setIsSaving(false);
    }
  }, [spaceId]);

  // Throttled Auto-save (skip for read-only contracts or when viewing a specific submission)
  useEffect(() => {
    if (step > 4 || isLoading || isReadOnly) return;
    const handler = setTimeout(() => {
      saveDraft(formData, false);
    }, 2000);
    return () => clearTimeout(handler);
  }, [formData, saveDraft, step, isLoading, isReadOnly]);

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  // 계좌번호 유효성 검사 (은행별 자릿수 기반)
  const validateBankAccount = (bankName: string, rawDigits: string): string | null => {
    if (!bankName) return "은행을 선택해주세요.";
    if (!rawDigits.trim()) return "계좌번호를 입력해주세요.";

    const fmt = BANK_FORMATS[bankName];
    if (!fmt) return "지원하지 않는 은행입니다.";

    const digits = stripNonDigits(rawDigits);
    if (digits.length < fmt.totalDigits) {
      return `${fmt.label} 계좌번호는 ${fmt.totalDigits}자리입니다. (현재 ${digits.length}자리)`;
    }
    if (digits.length > fmt.totalDigits) {
      return `${fmt.label} 계좌번호는 ${fmt.totalDigits}자리입니다. (초과 입력)`;
    }
    return null;
  };

  /** Handle bank selection change */
  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBankName = e.target.value;
    // Reset account number when bank changes (formats differ)
    setFormData(prev => ({ ...prev, bankName: newBankName, bankAccount: "" }));
    setBankAccountError(null);
    setBankAccountTouched(false);
  };

  /** Handle account number input with auto-formatting */
  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = stripNonDigits(e.target.value);
    const fmt = BANK_FORMATS[formData.bankName];
    // Cap digits at the bank's total
    const capped = fmt ? raw.slice(0, fmt.totalDigits) : raw.slice(0, 16);
    setFormData(prev => ({ ...prev, bankAccount: capped }));

    if (bankAccountTouched) {
      setBankAccountError(validateBankAccount(formData.bankName, capped));
    }
  };

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
    
    // Validate required fields before submission
    if (!formData.address || !formData.bankName || !formData.bankAccount || !formData.usagePurpose) {
      setError("주소, 은행 및 계좌 정보, 입주 목적을 모두 입력해주세요.");
      setStep(4);
      return;
    }

    // 계좌번호 유효성 재검증
    const bankError = validateBankAccount(formData.bankName, formData.bankAccount);
    if (bankError) {
      setError(bankError);
      setBankAccountError(bankError);
      setBankAccountTouched(true);
      setStep(4);
      return;
    }

    if (!formData.privacyAgreed || !formData.termsAgreed) {
      setError("모든 필수 약관에 동의해주세요.");
      setStep(3);
      return;
    }

    if (!paymentComplete) {
      setError("결제를 완료해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      contractId: formData.contractId,
      spaceId: Number(spaceId),
      desiredStartDate: formData.desiredStartDate,
      desiredDurationMonths: Number(formData.desiredDurationMonths),
      usagePurpose: formData.usagePurpose,
      requestNote: formData.requestNote || "",
      address: formData.address,
      bankAccount: `${BANK_FORMATS[formData.bankName]?.label || formData.bankName} ${formatAccountNumber(formData.bankAccount, BANK_FORMATS[formData.bankName]?.groups || [])}`,
      privacyAgreed: formData.privacyAgreed
    };

    console.log("Submitting contract application:", payload);

    try {
      const response = await fetch('/api/contracts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // Try to parse backend error for a better message
        let errorMsg = "신청 처리 중 오류가 발생했습니다.";
        try {
          const errBody = await response.json();
          if (errBody.message) errorMsg = errBody.message;
        } catch { /* ignore parse errors */ }

        if (response.status === 401) {
          setError("로그인이 만료되었습니다. 다시 로그인해주세요.");
          return;
        }
        throw new Error(errorMsg);
      }

      localStorage.removeItem(`contract_draft_${spaceId}`);
      setStep(5);
    } catch (err: any) {
      setError(err.message || "신청 도중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { title: "SCHEDULE", icon: Calendar },
    { title: "DETAILS", icon: Home },
    { title: "AGREEMENT", icon: ShieldCheck },
    { title: "PAYMENT", icon: CreditCard }
  ];

  return (
    <div className="max-w-[900px] mx-auto">
      {/* Editorial Step Tracker */}
      {step < 5 && (
        <div className="flex flex-col items-start mb-12 gap-6">
          {formData.status !== "DRAFT" && (
            <div className="flex items-center gap-4 px-6 py-3 bg-accent/10 border border-accent/20 rounded-full shrink-0">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span className="text-[10px] font-black tracking-[0.2em] text-accent uppercase">
                {isReadOnly ? "FINALIZED SUBMISSION" : "VIEWING/EDITING SUBMISSION"} - {formData.status}
              </span>
            </div>
          )}
          {!isReadOnly && (
            <div className="flex items-center justify-between w-full gap-4 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-6 group">
                  <span className={`text-[12px] font-black tracking-[0.3em] transition-colors ${step >= i + 1 ? "text-primary" : "text-primary/20"
                    }`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={`text-[12px] font-black tracking-[0.2em] transition-all whitespace-nowrap ${step === i + 1 ? "text-accent" : "text-primary/10"
                    }`}>
                    {s.title}
                  </span>
                  {i < steps.length - 1 && (
                    <div className={`w-12 h-[1px] ${step > i + 1 ? "bg-accent" : "bg-primary/5"}`} />
                  )}
                </div>
              ))}
            </div>
          )}
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
                    <Loader2 className="w-3 h-3 animate-spin" />
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
                        min={minStartDate || undefined}
                        className="w-full bg-primary/5 border-none p-6 rounded-2xl text-lg font-bold focus:ring-2 focus:ring-accent transition-all disabled:opacity-50"
                      />
                      {minStartDate && (
                        <p className="text-xs font-bold text-accent tracking-tight mt-2">
                          현재 입주자의 계약 종료일({minStartDate}) 이후부터 입주 시작일을 선택할 수 있습니다.
                        </p>
                      )}
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

                  {/* User Profile Info Card */}
                  {userProfile && (
                    <div className="p-8 bg-primary/[0.03] rounded-[2rem] border border-primary/10 space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-5 h-5 text-accent" />
                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-accent">MY INFORMATION</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { label: "NAME", value: userProfile.name },
                          { label: "PHONE", value: userProfile.phone },
                          { label: "EMAIL", value: userProfile.email },
                          { label: "GENDER", value: userProfile.gender === "MALE" ? "남성" : userProfile.gender === "FEMALE" ? "여성" : userProfile.gender },
                          { label: "NATIONALITY", value: userProfile.nationality },
                          { label: "BIRTH DATE", value: userProfile.birthDate },
                        ].filter(item => item.value).map((item) => (
                          <div key={item.label} className="space-y-1">
                            <span className="text-[9px] font-black tracking-[0.3em] uppercase text-primary/30 block">{item.label}</span>
                            <p className="text-sm font-bold tracking-tight text-primary">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                      REVIEW &<br />AGREEMENT
                    </h2>
                    <p className="text-lg font-medium tracking-tight opacity-50">
                      원활한 입주를 위해 아래 약관 및 서약서 내용을 확인해 주세요.
                    </p>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button type="button" onClick={prevStep} className="py-8 border-2 border-primary/10 text-primary rounded-full font-black tracking-[0.2em] transition-all hover:bg-primary/5">
                      GO BACK
                    </button>
                    <button type="button" onClick={nextStep} disabled={!formData.privacyAgreed || !formData.termsAgreed} className="py-8 bg-primary hover:bg-accent text-background rounded-full font-black tracking-[0.2em] transition-all disabled:opacity-20">
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
                      BILLING &<br />PAYMENT
                    </h2>
                  </div>

                  <div className="p-8 bg-primary/5 rounded-[2rem] border-l-4 border-accent space-y-4">
                    <p className="text-sm font-bold tracking-tight opacity-70">
                      입력하신 계좌 정보는 입주 심사 승인 및 계약 진행 시 대조용으로 활용되며,
                      퇴거 시 보증금 반환 계좌로 우선 사용됩니다.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <label className="text-[10px] font-black tracking-[0.3em] uppercase text-primary/40 block">
                      BANK ACCOUNT INFO (보증금 반환 계좌)
                    </label>

                    {/* Bank Selection */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-black tracking-[0.3em] uppercase text-primary/30 block">
                        BANK
                      </span>
                      <select
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleBankChange}
                        disabled={isReadOnly}
                        className="w-full bg-primary/5 border-none p-6 rounded-2xl text-lg font-bold focus:ring-2 focus:ring-accent transition-all appearance-none disabled:opacity-50"
                      >
                        <option value="">은행을 선택하세요</option>
                        {BANK_LIST.map(b => (
                          <option key={b.key} value={b.key}>{b.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Account Number Input – shown only after bank is selected */}
                    {formData.bankName && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black tracking-[0.3em] uppercase text-primary/30">
                            ACCOUNT NUMBER
                          </span>
                          {BANK_FORMATS[formData.bankName] && (
                            <span className="text-[9px] font-bold tracking-tight text-accent">
                              {BANK_FORMATS[formData.bankName].groups.map(g => "0".repeat(g)).join("-")} ({BANK_FORMATS[formData.bankName].totalDigits}자리)
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formData.bankAccount
                            ? formatAccountNumber(formData.bankAccount, BANK_FORMATS[formData.bankName]?.groups || [])
                            : ""}
                          onChange={handleAccountNumberChange}
                          onBlur={() => {
                            setBankAccountTouched(true);
                            setBankAccountError(validateBankAccount(formData.bankName, formData.bankAccount));
                          }}
                          disabled={isReadOnly}
                          placeholder={BANK_FORMATS[formData.bankName]?.groups.map(g => "0".repeat(g)).join("-") || "계좌번호 입력"}
                          className={`w-full bg-primary/5 p-6 rounded-2xl text-lg font-bold tracking-widest focus:ring-2 transition-all disabled:opacity-50 ${
                            bankAccountTouched && bankAccountError
                              ? "border-2 border-red-400 focus:ring-red-300"
                              : bankAccountTouched && !bankAccountError && formData.bankAccount
                                ? "border-2 border-green-400 focus:ring-green-300"
                                : "border-none focus:ring-accent"
                          }`}
                        />

                        {/* Validation Messages */}
                        {bankAccountTouched && bankAccountError && (
                          <div className="flex items-center gap-2 text-red-500">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-xs font-bold">{bankAccountError}</span>
                          </div>
                        )}
                        {bankAccountTouched && !bankAccountError && formData.bankAccount && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-xs font-bold">유효한 계좌 형식입니다</span>
                          </div>
                        )}

                        {/* Digit counter */}
                        {BANK_FORMATS[formData.bankName] && (
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-primary/30 tracking-tight">
                              숫자만 입력하세요 — 하이픈은 자동 삽입됩니다
                            </p>
                            <span className={`text-[10px] font-black tracking-wider ${
                              stripNonDigits(formData.bankAccount).length === BANK_FORMATS[formData.bankName].totalDigits
                                ? "text-green-600" : "text-primary/30"
                            }`}>
                              {stripNonDigits(formData.bankAccount).length}/{BANK_FORMATS[formData.bankName].totalDigits}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-6">
                    <label className="text-[10px] font-black tracking-[0.3em] uppercase text-primary/40 block">
                      PAYMENT METHOD (보증금 납부 방법)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === "card"
                            ? "border-accent bg-accent/10 shadow-lg shadow-accent/10"
                            : "border-primary/10 hover:border-accent/40 bg-primary/[0.02]"
                          }`}
                      >
                        <CreditCard className={`w-8 h-8 ${paymentMethod === "card" ? "text-accent" : "text-primary/40"}`} />
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase">CREDIT CARD</span>
                        <span className="text-[9px] font-bold tracking-tight opacity-50">신용/체크카드 결제</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod("transfer");
                          // Generate virtual account
                          const banks = ["국민은행", "신한은행", "하나은행", "우리은행", "농협은행"];
                          const bank = banks[Math.floor(Math.random() * banks.length)];
                          const acct = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(10000 + Math.random() * 90000)}`;
                          setVirtualAccount({ bank, account: acct, holder: "㈜코끼리" });
                        }}
                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === "transfer"
                            ? "border-accent bg-accent/10 shadow-lg shadow-accent/10"
                            : "border-primary/10 hover:border-accent/40 bg-primary/[0.02]"
                          }`}
                      >
                        <Building className={`w-8 h-8 ${paymentMethod === "transfer" ? "text-accent" : "text-primary/40"}`} />
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase">BANK TRANSFER</span>
                        <span className="text-[9px] font-bold tracking-tight opacity-50">가상계좌 이체</span>
                      </button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {paymentMethod === "card" && !paymentComplete && (
                      <motion.div
                        key="card-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-8 bg-white rounded-[2rem] border border-primary/10 shadow-xl space-y-6">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-accent" />
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-accent">CARD PAYMENT</span>
                          </div>

                          <div className="p-6 bg-accent/5 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-primary/40">결제 금액</span>
                              <span className="text-2xl font-black tracking-tight text-primary">₩{(roomDeposit || 0).toLocaleString()}</span>
                            </div>
                            <p className="text-[10px] font-bold tracking-tight opacity-50">
                              해당 방의 보증금 금액입니다. 결제 완료 후 계약 신청이 제출됩니다.
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={isPaymentProcessing}
                            onClick={handlePortoneCardPayment}
                            className="w-full py-6 bg-accent text-white rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all hover:bg-primary disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-accent/20"
                          >
                            {isPaymentProcessing ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> PROCESSING PAYMENT...</>
                            ) : (
                              <><CreditCard className="w-5 h-5" /> PAY WITH CARD</>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {paymentMethod === "transfer" && virtualAccount && !paymentComplete && (
                      <motion.div
                        key="transfer-info"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-8 bg-white rounded-[2rem] border border-primary/10 shadow-xl space-y-6">
                          <div className="flex items-center gap-3">
                            <Building className="w-5 h-5 text-accent" />
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-accent">VIRTUAL ACCOUNT</span>
                          </div>

                          <div className="bg-accent/5 p-6 rounded-2xl space-y-4">
                            {[
                              { label: "은행", value: virtualAccount.bank },
                              { label: "계좌번호", value: virtualAccount.account },
                              { label: "예금주", value: virtualAccount.holder },
                            ].map((item) => (
                              <div key={item.label} className="flex items-center justify-between">
                                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-primary/40">{item.label}</span>
                                <span className="text-sm font-black tracking-tight text-primary">{item.value}</span>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => setPaymentComplete(true)}
                            className="w-full py-5 bg-accent text-white rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all hover:bg-primary flex items-center justify-center gap-3"
                          >
                            <CheckCircle2 className="w-4 h-4" /> CONFIRM TRANSFER COMPLETE
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {paymentComplete && (
                      <motion.div
                        key="payment-done"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 bg-accent/10 rounded-[2rem] border border-accent/20 text-center space-y-4"
                      >
                        <CheckCircle2 className="w-12 h-12 text-accent mx-auto" />
                        <h3 className="text-lg font-black tracking-tighter uppercase">Payment Confirmed</h3>
                        <p className="text-sm font-bold tracking-tight opacity-60">
                          {paymentMethod === "card" ? "카드 결제가 완료되었습니다." : "입금 확인이 완료되었습니다."}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

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
                      disabled={isReadOnly || isSubmitting || !formData.privacyAgreed || !formData.termsAgreed || (paymentMethod !== null && !paymentComplete)}
                      className="py-8 bg-primary hover:bg-accent text-background rounded-full font-black tracking-[0.2em] transition-all flex justify-center items-center gap-4 disabled:opacity-20 shadow-xl shadow-primary/10"
                    >
                      {isSubmitting ? (
                        <>SUBMITTING... <Loader2 className="w-5 h-5 animate-spin" /></>
                      ) : isReadOnly ? (
                        <>ALREADY SUBMITTED <ShieldCheck className="w-5 h-5" /></>
                      ) : (
                        <>SUBMIT APPLICATION <Send className="w-5 h-5" /></>
                      )}
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


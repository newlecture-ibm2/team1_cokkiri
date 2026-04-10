"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CreditCard } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePaymentModal({ isOpen, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    userId: "",
    contractId: "",
    type: "RENT",
    amount: "",
    status: "PENDING",
    billingDate: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setForm({
      userId: "",
      contractId: "",
      type: "RENT",
      amount: "",
      status: "PENDING",
      billingDate: new Date().toISOString().split('T')[0],
    });
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!form.userId || !form.amount || !form.billingDate) {
      setError("필수 항목(사용자 ID, 금액, 청구일)을 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch("/admin/payments", {
        method: "POST",
        body: JSON.stringify({
          userId: Number(form.userId),
          contractId: form.contractId ? Number(form.contractId) : null,
          type: form.type,
          amount: Number(form.amount),
          status: form.status,
          billingDate: form.billingDate,
        }),
      });
      
      if (res.success) {
        resetForm();
        onSuccess();
      } else {
        setError(res.message || "결제 등록에 실패했습니다.");
      }
    } catch (err: any) {
      setError(err.message || "네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-8 pb-4 border-b border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase text-accent mb-0.5">
                    Manual Billing Entry
                  </p>
                  <h2 className="text-xl font-black uppercase tracking-tighter">
                    결제 정보 직접 등록
                  </h2>
                </div>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="w-10 h-10 rounded-full hover:bg-muted/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 flex flex-col gap-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">
                    사용자 ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="User ID"
                    value={form.userId}
                    onChange={(e) => setForm({ ...form, userId: e.target.value })}
                    className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">
                    계약 ID (선택)
                  </label>
                  <input
                    type="number"
                    placeholder="Contract ID"
                    value={form.contractId}
                    onChange={(e) => setForm({ ...form, contractId: e.target.value })}
                    className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">
                    결제 유형 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                  >
                    <option value="RENT">월세 (RENT)</option>
                    <option value="MAINTENANCE">관리비 (MAINTENANCE)</option>
                    <option value="FACILITY">시설 이용료 (FACILITY)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">
                    상태 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                  >
                    <option value="UNPAID">미납 (UNPAID)</option>
                    <option value="PENDING">진행중 (PENDING)</option>
                    <option value="PAID">완납 (PAID)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">
                    금액 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="₩ 0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">
                    청구일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.billingDate}
                    onChange={(e) => setForm({ ...form, billingDate: e.target.value })}
                    className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 pt-4 border-t border-primary/10 flex gap-4">
              <button
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="flex-1 px-6 py-4 bg-primary/5 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-primary/10 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 bg-primary text-background text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                결제 등록
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, UserPlus } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateContractModal({ isOpen, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    userId: "",
    spaceId: "",
    startDate: "",
    endDate: "",
    monthlyRent: "",
    deposit: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setForm({
      userId: "",
      spaceId: "",
      startDate: "",
      endDate: "",
      monthlyRent: "",
      deposit: "",
    });
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!form.userId || !form.spaceId || !form.startDate || !form.endDate || !form.monthlyRent || !form.deposit) {
      setError("모든 필수 항목을 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(form.userId),
          spaceId: Number(form.spaceId),
          startDate: form.startDate,
          endDate: form.endDate,
          monthlyRent: Number(form.monthlyRent),
          deposit: Number(form.deposit),
        }),
      });
      const result = await res.json();
      if (result.success) {
        resetForm();
        onSuccess();
      } else {
        setError(result.message || "계약 등록에 실패했습니다.");
      }
    } catch (err) {
      setError("네트워크 오류가 발생했습니다.");
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
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase text-accent mb-0.5">
                    Admin Direct Registration
                  </p>
                  <h2 className="text-xl font-black uppercase tracking-tighter">
                    계약 직접 등록
                  </h2>
                </div>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="w-10 h-10 rounded-full hover:bg-primary/[0.05] flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 flex flex-col gap-6">
              <p className="text-xs font-bold text-muted leading-relaxed border-l-2 border-accent pl-4">
                관리자가 직접 계약을 등록합니다. 신청 단계를 생략하고 즉시 ACTIVE 상태로 생성되며,
                해당 공간은 OCCUPIED로 변경되고 사용자는 RESIDENT로 승격됩니다.
              </p>

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
                    공간 ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Space ID"
                    value={form.spaceId}
                    onChange={(e) => setForm({ ...form, spaceId: e.target.value })}
                    className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">
                    시작일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">
                    종료일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">
                    월세 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="₩ 0"
                    value={form.monthlyRent}
                    onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })}
                    className="bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">
                    보증금 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="₩ 0"
                    value={form.deposit}
                    onChange={(e) => setForm({ ...form, deposit: e.target.value })}
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
                계약 등록
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ShieldCheck, Banknote } from 'lucide-react';
import { approvePayment } from '../_api';
import {
  Payment,
  PaymentMethod,
  TYPE_LABELS,
  METHOD_LABELS,
} from '../_types';

interface Props {
  payment: Payment | null;
  onClose: () => void;
  onSuccess: () => void;
}

const OVERLAY = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const PANEL = {
  hidden: { opacity: 0, scale: 0.92, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 28, stiffness: 340 },
  },
  exit: { opacity: 0, scale: 0.92, y: 24, transition: { duration: 0.18 } },
};

export function ApprovePaymentModal({ payment, onClose, onSuccess }: Props) {
  const [method, setMethod] = useState<PaymentMethod>('TRANSFER');
  const [paidDate, setPaidDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    if (!payment) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await approvePayment(payment.paymentId, {
        paymentMethod: method,
        paidDate,
      });
      if (res.success) {
        onSuccess();
      } else {
        setError(res.message || '결제 승인에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || '네트워크 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldBase =
    'bg-primary/[0.03] p-4 rounded-xl text-sm font-bold focus:ring-2 ring-accent outline-none border border-primary/5 transition-all';

  return (
    <AnimatePresence>
      {payment && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          variants={OVERLAY}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            variants={PANEL}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-8 pb-4 border-b border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase text-accent mb-0.5">
                    Payment Approval
                  </p>
                  <h2 className="text-xl font-black uppercase tracking-tighter">
                    결제 승인
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
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

              {/* Payment info summary */}
              <div className="bg-primary/[0.03] rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-[10px] font-black tracking-widest uppercase text-muted">
                    결제 번호
                  </span>
                  <span className="font-mono text-sm font-bold">
                    #{payment.paymentId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-black tracking-widest uppercase text-muted">
                    사용자
                  </span>
                  <span className="text-sm font-bold">
                    {payment.userName || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-black tracking-widest uppercase text-muted">
                    유형
                  </span>
                  <span className="text-sm font-bold">
                    {TYPE_LABELS[payment.type]}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-primary/10 pt-3">
                  <span className="text-[10px] font-black tracking-widest uppercase text-muted flex items-center gap-1">
                    <Banknote className="w-3.5 h-3.5" />
                    금액
                  </span>
                  <span className="text-lg font-black">
                    {Number(payment.amount || 0).toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* Approval fields */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">
                    결제 수단 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                    className={fieldBase}
                  >
                    {(Object.keys(METHOD_LABELS) as PaymentMethod[]).map(
                      (key) => (
                        <option key={key} value={key}>
                          {METHOD_LABELS[key]}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">
                    납부일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={paidDate}
                    onChange={(e) => setPaidDate(e.target.value)}
                    className={fieldBase}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 pt-4 border-t border-primary/10 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-4 bg-primary/5 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-primary/10 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-primary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                승인 처리
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

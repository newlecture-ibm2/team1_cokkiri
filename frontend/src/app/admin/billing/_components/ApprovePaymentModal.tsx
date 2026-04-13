'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ShieldCheck, Banknote, CreditCard, Building2, Copy, CheckCircle2 } from 'lucide-react';
import { approvePayment } from '../_api';
import {
  Payment,
  PaymentMethod,
  TYPE_LABELS,
  METHOD_LABELS,
} from '../_types';

// PortOne V2 SDK (loaded via script tag in layout.tsx)
declare global {
  interface Window {
    PortOne?: any;
  }
}

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
    transition: { type: 'spring' as const, damping: 28, stiffness: 340 },
  },
  exit: { opacity: 0, scale: 0.92, y: 24, transition: { duration: 0.18 } },
};

// 가상계좌 정보 (데모용)
const VIRTUAL_ACCOUNTS = [
  { bank: '국민은행', account: '940-810-01-2847561', holder: '(주)코끼리' },
  { bank: '신한은행', account: '110-482-938271', holder: '(주)코끼리' },
  { bank: '우리은행', account: '1005-303-847291', holder: '(주)코끼리' },
];

export function ApprovePaymentModal({ payment, onClose, onSuccess }: Props) {
  const [method, setMethod] = useState<PaymentMethod>('TRANSFER');
  const [paidDate, setPaidDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [portoneCompleted, setPortoneCompleted] = useState(false);
  const [portonePaymentId, setPortonePaymentId] = useState<string | null>(null);

  // 카드 결제 (PortOne SDK)
  const handleCardPayment = async () => {
    if (!payment) return;

    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
    const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

    if (!storeId || !channelKey) {
      setError('PortOne 결제 설정이 완료되지 않았습니다. 환경변수를 확인해주세요.');
      return;
    }

    if (!window.PortOne) {
      setError('결제 모듈이 로드되지 않았습니다. 페이지를 새로고침해주세요.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const paymentId = `billing-${payment.paymentId}-${Date.now()}`;
      const response = await window.PortOne.requestPayment({
        storeId,
        channelKey,
        paymentId,
        orderName: `코끼리 ${TYPE_LABELS[payment.type]} - #${payment.paymentId}`,
        totalAmount: Number(payment.amount),
        currency: 'CURRENCY_KRW',
        payMethod: 'CARD',
      });

      if (response && !response.code) {
        setPortonePaymentId(paymentId);
        setPortoneCompleted(true);
      } else {
        setError(response?.message || '결제가 취소되었거나 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || '결제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 최종 승인 처리 (백엔드 상태 변경)
  const handleApprove = async () => {
    if (!payment) return;

    // 카드 결제는 PortOne 결제가 완료되어야 승인 가능
    if (method === 'CARD' && !portoneCompleted) {
      setError('먼저 카드 결제를 진행해주세요.');
      return;
    }

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

  // 계좌번호 복사
  const handleCopyAccount = (account: string) => {
    navigator.clipboard.writeText(account.replace(/-/g, ''));
    setCopiedAccount(account);
    setTimeout(() => setCopiedAccount(null), 2000);
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
            className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto"
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

              {/* 결제 수단 선택 */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest">
                  결제 수단 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CARD', 'TRANSFER', 'CASH'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMethod(m);
                        setPortoneCompleted(false);
                        setPortonePaymentId(null);
                        setError(null);
                      }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                        method === m
                          ? 'border-accent bg-accent/5 text-accent'
                          : 'border-primary/10 hover:border-primary/20'
                      }`}
                    >
                      {m === 'CARD' && <CreditCard className="w-5 h-5" />}
                      {m === 'TRANSFER' && <Building2 className="w-5 h-5" />}
                      {m === 'CASH' && <Banknote className="w-5 h-5" />}
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        {METHOD_LABELS[m]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 카드 결제: PortOne 결제 버튼 */}
              {method === 'CARD' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-3"
                >
                  {portoneCompleted ? (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                      <div>
                        <p className="text-sm font-black text-green-700">카드 결제 완료</p>
                        <p className="text-xs text-green-600 font-mono mt-0.5">
                          {portonePaymentId}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCardPayment}
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                      PortOne 카드 결제
                    </button>
                  )}
                </motion.div>
              )}

              {/* 계좌이체: 가상계좌 정보 */}
              {method === 'TRANSFER' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-3"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted">
                    입금 계좌 정보
                  </p>
                  <div className="bg-primary/[0.03] rounded-2xl overflow-hidden divide-y divide-primary/5">
                    {VIRTUAL_ACCOUNTS.map((va) => (
                      <div
                        key={va.account}
                        className="p-4 flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black tracking-wider uppercase text-accent">
                            {va.bank}
                          </p>
                          <p className="text-sm font-mono font-bold mt-0.5 truncate">
                            {va.account}
                          </p>
                          <p className="text-[10px] text-muted font-bold mt-0.5">
                            예금주: {va.holder}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyAccount(va.account)}
                          className="shrink-0 w-9 h-9 rounded-xl bg-accent/10 hover:bg-accent/20 flex items-center justify-center transition-colors"
                        >
                          {copiedAccount === va.account ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-accent" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted font-bold text-center">
                    입금 확인 후 아래 승인 버튼을 클릭해주세요
                  </p>
                </motion.div>
              )}

              {/* 현금: 간단 안내 */}
              {method === 'CASH' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="bg-primary/[0.03] rounded-2xl p-5 text-center">
                    <Banknote className="w-8 h-8 mx-auto text-accent mb-2" />
                    <p className="text-sm font-bold">현금 수령 확인</p>
                    <p className="text-[10px] text-muted font-bold mt-1">
                      현금 수령을 확인하신 후 승인 버튼을 클릭해주세요
                    </p>
                  </div>
                </motion.div>
              )}

              {/* 납부일 */}
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
                disabled={isSubmitting || (method === 'CARD' && !portoneCompleted)}
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

'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Plus,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  Banknote,
} from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import PaymentTable from './_components/PaymentTable';
import { Payment, PaymentListResponse, STATUS_LABELS } from './_types';
import { CreatePaymentModal } from './_components/CreatePaymentModal';
import { ApprovePaymentModal } from './_components/ApprovePaymentModal';

/* ── Summary card metrics ── */
function useSummary(payments: Payment[]) {
  const total = payments.length;
  const paid = payments.filter((p) => p.status === 'PAID');
  const pending = payments.filter((p) => p.status === 'PENDING');
  const unpaid = payments.filter((p) => p.status === 'UNPAID');

  const sumAmount = (list: Payment[]) =>
    list.reduce((s, p) => s + Number(p.amount || 0), 0);

  return {
    totalCount: total,
    paidCount: paid.length,
    paidAmount: sumAmount(paid),
    pendingCount: pending.length,
    pendingAmount: sumAmount(pending),
    unpaidCount: unpaid.length,
    unpaidAmount: sumAmount(unpaid),
    totalAmount: sumAmount(payments),
  };
}

export default function BillingPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<Payment | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiFetch<PaymentListResponse>('/admin/payments');
      setPayments(result.data?.payments || []);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('결제 목록을 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const summary = useSummary(payments);

  /* ── Summary cards config ── */
  const cards = [
    {
      label: '총 결제',
      icon: TrendingUp,
      count: summary.totalCount,
      amount: summary.totalAmount,
      color: 'bg-primary/10 text-primary',
      ring: 'ring-primary/20',
    },
    {
      label: STATUS_LABELS.PAID,
      icon: CheckCircle2,
      count: summary.paidCount,
      amount: summary.paidAmount,
      color: 'bg-accent/10 text-accent',
      ring: 'ring-accent/20',
    },
    {
      label: STATUS_LABELS.PENDING,
      icon: Clock,
      count: summary.pendingCount,
      amount: summary.pendingAmount,
      color: 'bg-yellow-500/10 text-yellow-700',
      ring: 'ring-yellow-300/30',
    },
    {
      label: STATUS_LABELS.UNPAID,
      icon: AlertCircle,
      count: summary.unpaidCount,
      amount: summary.unpaidAmount,
      color: 'bg-red-500/10 text-red-600',
      ring: 'ring-red-300/30',
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-6 md:p-12 bg-background min-h-screen text-primary">
      {/* ══════════ Header ══════════ */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b-2 border-primary">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-accent">
            Admin / Billing Management
          </p>
          <h1 className="text-[10vw] md:text-[6vw] font-black tracking-tighter leading-[0.85] uppercase">
            Billing
          </h1>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCreateOpen(true)}
          className="px-8 py-5 bg-primary text-background rounded-full font-black tracking-widest uppercase text-[10px] flex items-center gap-3 transition-all hover:bg-accent shadow-lg"
        >
          <Plus className="w-4 h-4" />
          결제 등록
        </motion.button>
      </section>

      {/* ══════════ Summary Cards ══════════ */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`group relative overflow-hidden rounded-2xl border border-border/40 p-6 ring-1 ${c.ring} hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-2">
                  {c.label}
                </p>
                <p className="text-3xl font-black tracking-tighter">
                  {c.count}
                  <span className="text-xs font-bold tracking-tight text-muted ml-1">
                    건
                  </span>
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color}`}>
                <c.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="mt-3 text-sm font-bold tracking-tight text-muted">
              <Banknote className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
              {c.amount.toLocaleString()}원
            </p>
          </motion.div>
        ))}
      </section>

      {/* ══════════ Table Section ══════════ */}
      <section>
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              <p className="text-sm font-black uppercase tracking-[0.3em] text-muted">
                Loading…
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-600 font-bold text-center">{error}</p>
            <button
              onClick={fetchPayments}
              className="px-8 py-4 rounded-full bg-primary text-background font-black uppercase tracking-widest text-[10px] hover:bg-accent transition-colors"
            >
              다시 시도하기
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PaymentTable
                payments={payments}
                onApproveRequest={(payment) => setApproveTarget(payment)}
                onRefresh={fetchPayments}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </section>

      {/* ══════════ Modals ══════════ */}
      <CreatePaymentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          setIsCreateOpen(false);
          fetchPayments();
        }}
      />

      <ApprovePaymentModal
        payment={approveTarget}
        onClose={() => setApproveTarget(null)}
        onSuccess={() => {
          setApproveTarget(null);
          fetchPayments();
        }}
      />
    </div>
  );
}

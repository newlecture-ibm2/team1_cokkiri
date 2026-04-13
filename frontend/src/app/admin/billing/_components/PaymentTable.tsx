'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ChevronDown,
  CreditCard,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  Payment,
  PaymentStatus,
  PaymentType,
  TYPE_LABELS,
  STATUS_LABELS,
  METHOD_LABELS,
} from '../_types';
import { Badge } from '@/components/ui/badge';

/* ── Props ── */
interface PaymentTableProps {
  payments: Payment[];
  onApproveRequest: (payment: Payment) => void;
  onRefresh: () => void;
}

/* ── Status badge styling ── */
function statusBadge(status: PaymentStatus) {
  const map: Record<
    PaymentStatus,
    { bg: string; icon: typeof CheckCircle2; label: string }
  > = {
    PAID: { bg: 'bg-accent/15 text-accent border-accent/30', icon: CheckCircle2, label: STATUS_LABELS.PAID },
    PENDING: { bg: 'bg-yellow-500/15 text-yellow-700 border-yellow-400/30', icon: Clock, label: STATUS_LABELS.PENDING },
    UNPAID: { bg: 'bg-red-500/15 text-red-600 border-red-400/30', icon: AlertCircle, label: STATUS_LABELS.UNPAID },
  };
  const cfg = map[status];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${cfg.bg}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

export default function PaymentTable({
  payments,
  onApproveRequest,
}: PaymentTableProps) {
  /* ── Filter state ── */
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<PaymentType | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  const [sortField, setSortField] = useState<'billingDate' | 'amount'>('billingDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  /* ── Computed data ── */
  const filtered = useMemo(() => {
    let result = [...payments];

    if (statusFilter !== 'ALL') {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (typeFilter !== 'ALL') {
      result = result.filter((p) => p.type === typeFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          (p.userName || '').toLowerCase().includes(q) ||
          (p.loginId || '').toLowerCase().includes(q) ||
          String(p.paymentId).includes(q),
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'amount') {
        cmp = Number(a.amount) - Number(b.amount);
      } else {
        cmp = (a.billingDate || '').localeCompare(b.billingDate || '');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [payments, statusFilter, typeFilter, query, sortField, sortDir]);

  const toggleSort = (field: 'billingDate' | 'amount') => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const hasFilter = statusFilter !== 'ALL' || typeFilter !== 'ALL' || query.trim();

  return (
    <div className="flex flex-col gap-5">
      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름·아이디·번호 검색"
            className="w-full pl-11 pr-4 py-3 rounded-full bg-primary/[0.03] border border-primary/10 text-sm font-bold placeholder:text-muted focus:ring-2 ring-accent outline-none transition-all"
          />
        </div>

        {/* Status dropdown */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'ALL')}
            className="appearance-none pl-4 pr-10 py-3 rounded-full bg-primary/[0.03] border border-primary/10 text-[10px] font-black uppercase tracking-widest cursor-pointer focus:ring-2 ring-accent outline-none"
          >
            <option value="ALL">전체 상태</option>
            <option value="PAID">{STATUS_LABELS.PAID}</option>
            <option value="PENDING">{STATUS_LABELS.PENDING}</option>
            <option value="UNPAID">{STATUS_LABELS.UNPAID}</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
        </div>

        {/* Type dropdown */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as PaymentType | 'ALL')}
            className="appearance-none pl-4 pr-10 py-3 rounded-full bg-primary/[0.03] border border-primary/10 text-[10px] font-black uppercase tracking-widest cursor-pointer focus:ring-2 ring-accent outline-none"
          >
            <option value="ALL">전체 유형</option>
            <option value="RENT">{TYPE_LABELS.RENT}</option>
            <option value="MAINTENANCE">{TYPE_LABELS.MAINTENANCE}</option>
            <option value="FACILITY">{TYPE_LABELS.FACILITY}</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
        </div>

        {/* Clear filter */}
        {hasFilter && (
          <button
            onClick={() => {
              setStatusFilter('ALL');
              setTypeFilter('ALL');
              setQuery('');
            }}
            className="flex items-center gap-1.5 px-4 py-3 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
          >
            <X className="w-3 h-3" />
            초기화
          </button>
        )}

        {/* Count */}
        <span className="ml-auto text-[10px] font-black uppercase tracking-[0.3em] text-muted">
          <Filter className="inline w-3 h-3 mr-1 -mt-0.5" />
          {filtered.length} / {payments.length}건
        </span>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-2xl border border-border/40 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary text-background uppercase text-[10px] font-black tracking-widest">
                <th className="px-5 py-4 w-16">No.</th>
                <th className="px-5 py-4 min-w-[140px]">사용자</th>
                <th className="px-5 py-4 w-28">유형</th>
                <th
                  className="px-5 py-4 w-32 cursor-pointer select-none hover:text-accent transition-colors"
                  onClick={() => toggleSort('amount')}
                >
                  <span className="flex items-center gap-1">
                    금액
                    <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="px-5 py-4 w-28">상태</th>
                <th className="px-5 py-4 w-24">결제 수단</th>
                <th
                  className="px-5 py-4 w-28 cursor-pointer select-none hover:text-accent transition-colors"
                  onClick={() => toggleSort('billingDate')}
                >
                  <span className="flex items-center gap-1">
                    청구일
                    <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="px-5 py-4 w-28">납부일</th>
                <th className="px-5 py-4 w-24 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filtered.map((payment, idx) => (
                <motion.tr
                  key={payment.paymentId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="group hover:bg-primary/[0.03] transition-colors"
                >
                  <td className="px-5 py-4 font-mono text-xs text-muted">
                    {payment.paymentId}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-black text-[10px]">
                        {(payment.userName || '?')[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-tight">
                          {payment.userName || '-'}
                        </p>
                        <p className="text-[10px] text-muted tracking-wide">
                          {payment.loginId || '-'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      variant="outline"
                      className="bg-background text-[10px] font-black uppercase tracking-widest"
                    >
                      {TYPE_LABELS[payment.type] || payment.type}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 font-black text-sm">
                    {Number(payment.amount || 0).toLocaleString()}
                    <span className="text-[10px] font-bold text-muted ml-0.5">원</span>
                  </td>
                  <td className="px-5 py-4">{statusBadge(payment.status)}</td>
                  <td className="px-5 py-4 text-sm text-muted">
                    {payment.paymentMethod
                      ? METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod
                      : '-'}
                  </td>
                  <td className="px-5 py-4 text-sm text-muted tabular-nums">
                    {payment.billingDate || '-'}
                  </td>
                  <td className="px-5 py-4 text-sm text-muted tabular-nums">
                    {payment.paidDate || '-'}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {payment.status !== 'PAID' ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onApproveRequest(payment)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-background rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        승인
                      </motion.button>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-widest text-accent">
                        처리 완료
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center">
                        <CreditCard className="w-7 h-7 text-muted" />
                      </div>
                      <p className="text-sm font-bold text-muted">
                        {hasFilter
                          ? '필터 조건에 맞는 결제 내역이 없습니다.'
                          : '결제 내역이 없습니다.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

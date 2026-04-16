'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ChevronDown,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  X,
  Loader2,
  Banknote,
  User,
} from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import {
  Payment,
  PaymentStatus,
  PaymentType,
  PaymentListResponse,
  TYPE_LABELS,
  STATUS_LABELS,
  METHOD_LABELS,
} from '../_types';
import { Badge } from '@/components/ui/badge';

interface Props {
  refreshKey: number;
  onRefresh: () => void;
  onApproveRequest: (payment: Payment) => void;
}

const STATUS_COLORS: Record<PaymentStatus, string> = {
  PAID: 'bg-accent/15 text-accent',
  PENDING: 'bg-yellow-500/15 text-yellow-700',
  UNPAID: 'bg-red-500/15 text-red-600',
};

const STATUS_ICONS: Record<PaymentStatus, typeof CheckCircle2> = {
  PAID: CheckCircle2,
  PENDING: Clock,
  UNPAID: AlertCircle,
};

export function BillingListTab({ refreshKey, onRefresh, onApproveRequest }: Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Filter state ── */
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<PaymentType | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  const [sortField, setSortField] = useState<'billingDate' | 'amount'>('billingDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  /* ── Fetch ── */
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
  }, [fetchPayments, refreshKey]);

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

  /* ── Summary ── */
  const summary = useMemo(() => {
    const paid = payments.filter((p) => p.status === 'PAID');
    const pending = payments.filter((p) => p.status === 'PENDING');
    const unpaid = payments.filter((p) => p.status === 'UNPAID');
    const sumAmount = (list: Payment[]) =>
      list.reduce((s, p) => s + Number(p.amount || 0), 0);
    return {
      totalCount: payments.length,
      paidCount: paid.length,
      pendingCount: pending.length,
      unpaidCount: unpaid.length,
      totalAmount: sumAmount(payments),
      paidAmount: sumAmount(paid),
      pendingAmount: sumAmount(pending),
      unpaidAmount: sumAmount(unpaid),
    };
  }, [payments]);

  /* ── Status filter chips ── */
  const statuses: (PaymentStatus | 'ALL')[] = ['ALL', 'PAID', 'PENDING', 'UNPAID'];

  return (
    <>
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: '전체', value: summary.totalCount, amount: summary.totalAmount, color: 'text-primary' },
          { label: STATUS_LABELS.PAID, value: summary.paidCount, amount: summary.paidAmount, color: 'text-accent' },
          { label: STATUS_LABELS.PENDING, value: summary.pendingCount, amount: summary.pendingAmount, color: 'text-yellow-700' },
          { label: STATUS_LABELS.UNPAID, value: summary.unpaidCount, amount: summary.unpaidAmount, color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="p-6 bg-white rounded-2xl border border-primary/5 shadow-sm">
            <p className="text-xs font-black tracking-[0.2em] uppercase text-muted mb-2">{s.label}</p>
            <p className={`text-3xl font-black tracking-tighter ${s.color}`}>
              {s.value.toString().padStart(2, '0')}
            </p>
            <p className="mt-2 text-sm font-bold text-muted flex items-center gap-1">
              <Banknote className="w-3 h-3" />
              {s.amount.toLocaleString()}원
            </p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Status chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.15em] transition-all ${
                statusFilter === s
                  ? 'bg-primary text-background'
                  : 'bg-primary/5 text-primary/60 hover:bg-primary/10'
              }`}
            >
              {s === 'ALL' ? '전체' : STATUS_LABELS[s]}
            </button>
          ))}

          {/* Type dropdown */}
          <div className="relative ml-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as PaymentType | 'ALL')}
              className="appearance-none pl-4 pr-10 py-2 rounded-full bg-primary/5 border border-primary/10 text-xs font-black uppercase tracking-widest cursor-pointer focus:ring-2 ring-accent outline-none"
            >
              <option value="ALL">전체 유형</option>
              <option value="RENT">{TYPE_LABELS.RENT}</option>
              <option value="MAINTENANCE">{TYPE_LABELS.MAINTENANCE}</option>
              <option value="FACILITY">{TYPE_LABELS.FACILITY}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          </div>

          {hasFilter && (
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setTypeFilter('ALL');
                setQuery('');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
            >
              <X className="w-3 h-3" />
              초기화
            </button>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full border border-primary/10 focus-within:border-accent/40 transition-colors ml-auto">
            <Search className="w-3.5 h-3.5 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="이름·아이디·번호 검색..."
              className="bg-transparent text-sm font-bold placeholder:text-muted/40 focus:outline-none w-48"
            />
          </div>
          <span className="text-xs font-black uppercase tracking-[0.3em] text-muted">
            <Filter className="inline w-3 h-3 mr-1 -mt-0.5" />
            {filtered.length} / {payments.length}건
          </span>
        </div>
      </div>

      {/* ── Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] border border-primary/5 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-primary/[0.03] border-b border-primary/5">
                {['No.', '사용자', '유형', '', '상태', '결제 수단', '', '', ''].map(
                  (h, i) => {
                    // 금액·청구일·납부일 헤더에 정렬 기능
                    if (i === 3)
                      return (
                        <th
                          key="amount"
                          className="p-5 text-xs font-black uppercase tracking-widest text-primary/70 cursor-pointer select-none hover:text-primary transition-colors"
                          onClick={() => toggleSort('amount')}
                        >
                          <span className="flex items-center gap-1">
                            금액
                            <ArrowUpDown className="w-3 h-3" />
                          </span>
                        </th>
                      );
                    if (i === 6)
                      return (
                        <th
                          key="billingDate"
                          className="p-5 text-xs font-black uppercase tracking-widest text-primary/70 cursor-pointer select-none hover:text-primary transition-colors"
                          onClick={() => toggleSort('billingDate')}
                        >
                          <span className="flex items-center gap-1">
                            청구일
                            <ArrowUpDown className="w-3 h-3" />
                          </span>
                        </th>
                      );
                    if (i === 7)
                      return (
                        <th key="paidDate" className="p-5 text-xs font-black uppercase tracking-widest text-primary/70">
                          납부일
                        </th>
                      );
                    if (i === 8)
                      return (
                        <th key="action" className="p-5 text-xs font-black uppercase tracking-widest text-primary/70 text-center">
                          관리
                        </th>
                      );
                    return (
                      <th key={h || `col-${i}`} className="p-5 text-xs font-black uppercase tracking-widest text-primary/70">
                        {h}
                      </th>
                    );
                  },
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-accent animate-spin" />
                      <p className="text-xs font-black tracking-widest uppercase text-muted">
                        Loading payments...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                      </div>
                      <p className="text-red-600 font-bold text-center">{error}</p>
                      <button
                        onClick={fetchPayments}
                        className="px-8 py-3 rounded-full bg-primary text-background font-black uppercase tracking-widest text-xs hover:bg-accent transition-colors"
                      >
                        다시 시도하기
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-20 text-center">
                    <AlertCircle className="w-10 h-10 text-muted/30 mx-auto mb-3" />
                    <p className="text-sm font-bold text-muted uppercase tracking-widest">
                      {hasFilter
                        ? '필터 조건에 맞는 결제 내역이 없습니다.'
                        : '결제 내역이 없습니다.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((payment) => {
                  const Icon = STATUS_ICONS[payment.status];
                  return (
                    <tr
                      key={payment.paymentId}
                      className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors group"
                    >
                      <td className="p-5">
                        <span className="text-sm font-black opacity-60">
                          #{payment.paymentId}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center justify-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-base font-black text-primary">
                              {payment.userName || '-'}
                            </span>
                            <p className="text-xs text-primary/50 tracking-wide">
                              {payment.loginId || '-'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <Badge
                          variant="outline"
                          className="bg-primary/[0.03] text-[10px] font-black uppercase tracking-widest"
                        >
                          {TYPE_LABELS[payment.type] || payment.type}
                        </Badge>
                      </td>
                      <td className="p-5">
                        <span className="text-base font-black text-primary">
                          {Number(payment.amount || 0).toLocaleString()}
                          <span className="text-xs font-bold text-primary/50 ml-0.5">원</span>
                        </span>
                      </td>
                      <td className="p-5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-black tracking-[0.15em] uppercase px-3 py-1.5 rounded-full ${
                            STATUS_COLORS[payment.status] || 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          {STATUS_LABELS[payment.status] || payment.status}
                        </span>
                      </td>
                      <td className="p-5 text-sm text-primary/60">
                        {payment.paymentMethod
                          ? METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod
                          : '-'}
                      </td>
                      <td className="p-5 text-sm text-primary/60 tabular-nums">
                        {payment.billingDate || '-'}
                      </td>
                      <td className="p-5 text-sm text-primary/60 tabular-nums">
                        {payment.paidDate || '-'}
                      </td>
                      <td className="p-5 text-center">
                        {payment.status !== 'PAID' ? (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onApproveRequest(payment)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-background rounded-full text-xs font-black uppercase tracking-widest hover:bg-accent transition-colors shadow-sm"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              승인
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-black uppercase tracking-widest text-accent">
                            처리 완료
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </>
  );
}

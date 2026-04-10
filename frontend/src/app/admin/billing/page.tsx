'use client';

import { useEffect, useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import PaymentTable from './_components/PaymentTable';
import { Payment, PaymentListResponse } from './_types';

export default function BillingPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
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
    };

    fetchPayments();
  }, []);

  return (
    <div className="p-6 md:p-12 lg:px-24">
      <header className="mb-12">
        <h1 className="text-[12vw] md:text-[6vw] font-black tracking-tighter uppercase leading-[0.85] text-primary">
          Billing <span className="text-accent">Management</span>
        </h1>
        <p className="mt-4 text-muted text-lg font-medium tracking-tight uppercase">
          Review and approve payment records
        </p>
      </header>

      <section>
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              <p className="text-sm font-black uppercase tracking-[0.3em] text-muted">Loading...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-destructive font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-primary text-background font-black uppercase tracking-tighter hover:scale-[1.02] transition-transform text-sm"
            >
              다시 시도하기
            </button>
          </div>
        ) : (
          <PaymentTable initialPayments={payments} />
        )}
      </section>
    </div>
  );
}

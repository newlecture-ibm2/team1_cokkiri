import { getMyPayments } from './_api';
import MyPaymentHistory from './_components/MyPaymentHistory';
import { Payment } from '@/app/admin/billing/_types';

export const dynamic = 'force-dynamic';

export default async function MyPaymentsPage() {
  let payments: Payment[] = [];

  try {
    const result = await getMyPayments();
    payments = result.data?.payments || [];
  } catch {
    // Backend unavailable — show empty state
    payments = [];
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-[clamp(2rem,5vw,5rem)]">
        <div className="flex flex-col gap-[clamp(0.75rem,1.5vw,1.5rem)]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-[clamp(1rem,2vw,2rem)] border-b border-primary/10 pb-[clamp(1rem,2vw,2rem)]">
            <div className="min-w-0 space-y-4">
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight uppercase whitespace-nowrap text-primary">
                PAYMENT<span className="underline underline-offset-4 decoration-[var(--color-accent)]">S.</span>
                <span className="text-2xl md:text-4xl font-bold tracking-normal ml-2 align-bottom opacity-80">결제 내역</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <MyPaymentHistory initialPayments={payments} />

      {payments.length === 0 && (
        <div className="py-24 text-center border-2 border-dashed border-primary/10 rounded-[clamp(1rem,2vw,2rem)] bg-primary/2">
          <p className="text-lg font-bold tracking-tight text-primary">결제 내역이 없습니다</p>
          <p className="mt-2 text-sm font-black uppercase tracking-[0.2em] text-primary/80">
            No payment history found.
          </p>
        </div>
      )}
    </div>
  );
}

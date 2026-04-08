import { getMyPayments } from './_api';
import MyPaymentHistory from './_components/MyPaymentHistory';

export const dynamic = 'force-dynamic';

export default async function MyPaymentsPage() {
  let payments = [];

  try {
    const result = await getMyPayments();
    payments = result.data?.payments || [];
  } catch {
    // Backend unavailable — show empty state
    payments = [];
  }

  return (
    <div>
      <header className="mb-12">
        <h1 className="text-[10vw] md:text-[5vw] font-black tracking-tighter uppercase leading-[0.85] text-primary">
          My <span className="text-accent">Payments</span>
        </h1>
        <p className="mt-4 text-muted text-lg font-medium tracking-tight uppercase">
          Your personal billing and payment history
        </p>
      </header>

      <MyPaymentHistory initialPayments={payments} />

      {payments.length === 0 && (
        <div className="py-24 text-center border-2 border-dashed border-secondary/20 rounded-2xl bg-primary/5">
          <p className="text-lg font-medium text-muted-foreground uppercase tracking-widest leading-loose">
            No payment history found.<br />
            Moss & Aloe Co-Living.
          </p>
        </div>
      )}
    </div>
  );
}

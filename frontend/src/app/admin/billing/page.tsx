import { getPayments } from './_api';
import PaymentTable from './_components/PaymentTable';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const result = await getPayments();

  return (
    <div className="p-6 md:p-12 lg:px-24">
      <header className="mb-12">
        <h1 className="text-[12vw] md:text-[6vw] font-black tracking-tighter uppercase leading-[0.85] text-[#2C3424]">
          Billing <span className="text-[#768064]">Management</span>
        </h1>
        <p className="mt-4 text-[#4C583E] text-lg font-medium tracking-tight uppercase">
          Review and approve payment records
        </p>
      </header>

      <section>
        <PaymentTable initialPayments={result.data?.payments || []} />
      </section>
    </div>
  );
}

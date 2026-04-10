import { AdminReservationManager } from './_components/AdminReservationManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '예약 관리 | Admin',
};

export default function ReservationsPage() {
  return <AdminReservationManager />;
}

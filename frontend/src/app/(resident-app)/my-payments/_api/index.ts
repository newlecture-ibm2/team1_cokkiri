import { apiFetch } from '@/lib/api';
import { PaymentListResponse } from '@/app/admin/billing/_types'; // Re-use types if possible, but for residents we'll use a separate call

export const getMyPayments = async () => {
  return await apiFetch<PaymentListResponse>('/payments/my');
};

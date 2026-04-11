import { apiFetch } from '@/lib/api';
import {
  PaymentListResponse,
  ApprovePaymentRequest,
  CreatePaymentRequest,
  Payment,
} from '../_types';

export const getPayments = async () => {
  return await apiFetch<PaymentListResponse>('/admin/payments');
};

export const approvePayment = async (
  paymentId: number,
  data: ApprovePaymentRequest,
) => {
  return await apiFetch<Payment>(`/admin/payments/${paymentId}/approve`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const createPayment = async (data: CreatePaymentRequest) => {
  return await apiFetch<Payment>('/admin/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

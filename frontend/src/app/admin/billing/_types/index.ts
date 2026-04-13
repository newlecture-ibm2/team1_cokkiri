export type PaymentType = 'RENT' | 'MAINTENANCE' | 'FACILITY';
export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID';
export type PaymentMethod = 'CARD' | 'TRANSFER' | 'CASH';

export interface Payment {
  paymentId: number;
  contractId?: number;
  reservationId?: number;
  userId: number;
  userName?: string;
  loginId?: string;
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  billingDate: string;
  paidDate?: string;
  createdAt: string;
}

export interface PaymentListResponse {
  payments: Payment[];
}

export interface ApprovePaymentRequest {
  paymentMethod: string;
  paidDate: string;
}

export interface CreatePaymentRequest {
  userId: number;
  contractId?: number | null;
  reservationId?: number | null;
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
  billingDate: string;
}

export const TYPE_LABELS: Record<PaymentType, string> = {
  RENT: '월세',
  MAINTENANCE: '관리비',
  FACILITY: '시설 이용료',
};

export const STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: '미납',
  PENDING: '결제 대기',
  PAID: '완납',
};

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  CARD: '카드',
  TRANSFER: '계좌이체',
  CASH: '현금',
};

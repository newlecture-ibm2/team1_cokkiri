export interface Payment {
  paymentId: number;
  contractId?: number;
  reservationId?: number;
  userId: number;
  userName?: string;
  loginId?: string;
  type: 'RENT' | 'MAINTENANCE' | 'FACILITY';
  amount: number;
  status: 'UNPAID' | 'PENDING' | 'PAID';
  paymentMethod?: 'CARD' | 'TRANSFER' | 'CASH';
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

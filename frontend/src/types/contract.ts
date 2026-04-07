export type ContractStatus = 
  | 'DRAFT' 
  | 'PENDING' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'CANCELLED' 
  | 'ACTIVE' 
  | 'EXPIRED' 
  | 'TERMINATED';

export interface ContractDraftResult {
  contractId: number;
  spaceId: number;
  status: ContractStatus;
  desiredStartDate: string;
  desiredDurationMonths: number;
  address: string;
  bankAccount: string;
  usagePurpose: string;
  requestNote: string;
  privacyAgreed: boolean;
  rejectedReason?: string;
  createdAt: string;
}

export interface ContractSignResponse {
  contractId: number;
  status: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  message: string;
}


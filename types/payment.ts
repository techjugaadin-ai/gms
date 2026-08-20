export type PaymentType = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other';

export interface Payment {
  id: string;
  gymId: string;
  memberId: string;
  planId: string;
  amount: number;
  paymentDate: string;
  paymentType: PaymentType;
  notes?: string;
  createdAt: string;
}

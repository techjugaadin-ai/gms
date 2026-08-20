export type GymStatus = 'active' | 'suspended';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';
export type SubscriptionPlan = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'custom';

export interface Gym {
  id: string;
  name: string;
  ownerId: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  status: GymStatus;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  paymentStatus: PaymentStatus;
  subscriptionAmount: number;
  createdAt: string;
  updatedAt: string;
}

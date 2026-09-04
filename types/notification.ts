export type NotificationType =
  | 'MEMBERSHIP_EXPIRING_SOON'
  | 'MEMBERSHIP_EXPIRED'
  | 'PAYMENT_PENDING';

export interface Notification {
  id: string;
  gymId: string;
  memberId: string;
  type: NotificationType;
  message: string;
  scheduledAt: string;
  read: boolean;
  createdAt: string;
  daysUntilExpiry?: number;
}

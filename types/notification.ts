export type NotificationType =
  | 'MEMBERSHIP_EXPIRING_7_DAYS'
  | 'MEMBERSHIP_EXPIRING_3_DAYS'
  | 'MEMBERSHIP_EXPIRING_1_DAY'
  | 'MEMBERSHIP_EXPIRED_TODAY'
  | 'MEMBERSHIP_EXPIRED_2_DAYS'
  | 'MEMBERSHIP_EXPIRED_7_DAYS'
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
}

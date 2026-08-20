import { notificationRepo, memberRepo } from '@/lib/repositories';
import { generateId } from '@/lib/utils/id';
import { getMembershipStatus } from '@/lib/utils/date';
import type { NotificationType, Notification } from '@/types/notification';

export async function getNotifications(gymId: string) {
  return notificationRepo.findByGymId(gymId);
}

export async function markNotificationRead(id: string, gymId: string) {
  return notificationRepo.markAsRead(id, gymId);
}

const NOTIFICATION_RULES: { daysOffset: number; type: NotificationType; messageFn: (name: string, days: number) => string }[] = [
  { daysOffset: 7, type: 'MEMBERSHIP_EXPIRING_7_DAYS', messageFn: (n) => `${n}'s membership expires in 7 days` },
  { daysOffset: 3, type: 'MEMBERSHIP_EXPIRING_3_DAYS', messageFn: (n) => `${n}'s membership expires in 3 days` },
  { daysOffset: 1, type: 'MEMBERSHIP_EXPIRING_1_DAY', messageFn: (n) => `${n}'s membership expires tomorrow` },
  { daysOffset: 0, type: 'MEMBERSHIP_EXPIRED_TODAY', messageFn: (n) => `${n}'s membership expired today` },
  { daysOffset: -2, type: 'MEMBERSHIP_EXPIRED_2_DAYS', messageFn: (n) => `${n}'s membership expired 2 days ago` },
  { daysOffset: -7, type: 'MEMBERSHIP_EXPIRED_7_DAYS', messageFn: (n) => `${n}'s membership expired 7 days ago` },
];

export async function generateNotificationsForGym(gymId: string): Promise<void> {
  const members = await memberRepo.findByGymId(gymId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const now = new Date().toISOString();

  for (const member of members) {
    const endDate = new Date(member.membershipEndDate);
    endDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    for (const rule of NOTIFICATION_RULES) {
      if (diffDays === rule.daysOffset) {
        await notificationRepo.upsertForMember({
          id: generateId('notif'),
          gymId,
          memberId: member.id,
          type: rule.type,
          message: rule.messageFn(member.name, rule.daysOffset),
          scheduledAt: now,
          read: false,
          createdAt: now,
        });
      }
    }
  }
}

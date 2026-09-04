import { memberRepo } from '@/lib/repositories';
import type { Notification } from '@/types/notification';

export async function getNotifications(gymId: string) {
  const members = await memberRepo.findByGymId(gymId);
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const now = today.toISOString();
  const notifications: Notification[] = [];

  for (const member of members) {
    const endDate = new Date(`${member.membershipEndDate}T00:00:00Z`);
    if (Number.isNaN(endDate.getTime())) continue;
    const diffDays = Math.round((endDate.getTime() - todayUtc) / (1000 * 60 * 60 * 24));
    if (diffDays > 7) continue;

    notifications.push({
      id: `live_notif_${member.id}_${diffDays < 0 ? 'expired' : 'expiring'}`,
      gymId,
      memberId: member.id,
      type: diffDays < 0 ? 'MEMBERSHIP_EXPIRED' : 'MEMBERSHIP_EXPIRING_SOON',
      message: diffDays < 0
        ? `${member.name}'s membership expired ${Math.abs(diffDays)} days ago`
        : diffDays === 0
          ? `${member.name}'s membership expires today`
          : `${member.name}'s membership expires in ${diffDays} days`,
      scheduledAt: now,
      read: false,
      createdAt: now,
      daysUntilExpiry: diffDays,
    });
  }

  return notifications.sort((a, b) => (a.daysUntilExpiry ?? 0) - (b.daysUntilExpiry ?? 0));
}


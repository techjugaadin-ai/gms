import { memberRepo, paymentRepo, notificationRepo } from '@/lib/repositories';
import { getMembershipStatus, isToday, isInCurrentMonth } from '@/lib/utils/date';

export interface DashboardMetrics {
  totalMembers: number;
  activeMembers: number;
  expiringSoonMembers: number;
  expiredMembers: number;
  membersWithNoDues: number;
  membersWithDues: number;
  pendingPaymentsCount: number;
  todayCollection: number;
  monthlyCollection: number;
  newMembersToday: number;
  newMembersThisMonth: number;
  unreadNotificationsCount: number;
  last7DaysCollection: { date: string; amount: number }[];
}

export async function getDashboardMetrics(gymId: string): Promise<DashboardMetrics> {
  const [members, payments, notifications] = await Promise.all([
    memberRepo.findByGymId(gymId),
    paymentRepo.findByGymId(gymId),
    notificationRepo.findUnreadByGymId(gymId),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let activeMembers = 0;
  let expiringSoonMembers = 0;
  let expiredMembers = 0;

  for (const m of members) {
    const status = getMembershipStatus(m.membershipEndDate);
    if (status === 'ACTIVE') activeMembers++;
    else if (status === 'EXPIRING_SOON') expiringSoonMembers++;
    else expiredMembers++;
  }

  const membersWithNoDues = activeMembers + expiringSoonMembers;
  const membersWithDues = expiredMembers;

  const todayCollection = payments
    .filter((p) => isToday(p.paymentDate))
    .reduce((sum, p) => sum + p.amount, 0);

  const monthlyCollection = payments
    .filter((p) => isInCurrentMonth(p.paymentDate))
    .reduce((sum, p) => sum + p.amount, 0);

  const newMembersToday = members.filter((m) => isToday(m.joiningDate)).length;
  const newMembersThisMonth = members.filter((m) => isInCurrentMonth(m.joiningDate)).length;

  // Last 7 days collection
  const last7DaysCollection: { date: string; amount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const amount = payments
      .filter((p) => p.paymentDate === dateStr)
      .reduce((sum, p) => sum + p.amount, 0);
    last7DaysCollection.push({ date: dateStr, amount });
  }

  return {
    totalMembers: members.length,
    activeMembers,
    expiringSoonMembers,
    expiredMembers,
    membersWithNoDues,
    membersWithDues,
    pendingPaymentsCount: expiredMembers,
    todayCollection,
    monthlyCollection,
    newMembersToday,
    newMembersThisMonth,
    unreadNotificationsCount: notifications.length,
    last7DaysCollection,
  };
}

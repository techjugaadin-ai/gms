import { gymRepo, memberRepo } from '@/lib/repositories';
import { getMembershipStatus } from '@/lib/utils/date';

export interface AdminDashboardMetrics {
  totalGyms: number;
  activeGyms: number;
  suspendedGyms: number;
  totalMembers: number;
  totalRevenue: number;
  subscriptionsExpiringSoon: number;
  expiredSubscriptions: number;
  paidGyms: number;
  pendingPaymentGyms: number;
}

export async function getAdminDashboard(): Promise<AdminDashboardMetrics> {
  const gyms = await gymRepo.findAll();
  const today = new Date();

  let totalMembers = 0;
  for (const gym of gyms) {
    const members = await memberRepo.findByGymId(gym.id);
    totalMembers += members.length;
  }

  const activeGyms = gyms.filter((g) => g.status === 'active').length;
  const suspendedGyms = gyms.filter((g) => g.status === 'suspended').length;
  const paidGyms = gyms.filter((g) => g.paymentStatus === 'paid').length;
  const pendingPaymentGyms = gyms.filter((g) => g.paymentStatus !== 'paid').length;
  const totalRevenue = gyms
    .filter((g) => g.paymentStatus === 'paid')
    .reduce((sum, g) => sum + (g.subscriptionAmount ?? 0), 0);

  const subscriptionsExpiringSoon = gyms.filter((g) => {
    const end = new Date(g.subscriptionEndDate);
    const diffDays = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  }).length;

  const expiredSubscriptions = gyms.filter((g) => new Date(g.subscriptionEndDate) < today).length;

  return {
    totalGyms: gyms.length,
    activeGyms,
    suspendedGyms,
    totalMembers,
    totalRevenue,
    subscriptionsExpiringSoon,
    expiredSubscriptions,
    paidGyms,
    pendingPaymentGyms,
  };
}

export async function getAllGyms() {
  return gymRepo.findAll();
}

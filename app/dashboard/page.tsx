import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { getDashboardMetrics } from '@/lib/services/dashboard.service';
import { generateNotificationsForGym } from '@/lib/services/notification.service';
import { getGym } from '@/lib/services/gym.service';
import { AppLayout } from '@/components/layout/AppLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { CollectionChart } from '@/components/dashboard/CollectionChart';
import {
  Users, IndianRupee, UserCheck, UserX,
  UserPlus, Bell, TrendingUp, CalendarDays,
} from 'lucide-react';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/');
  if (user.role !== 'GYM_OWNER' || !user.gymId) redirect('/');

  await generateNotificationsForGym(user.gymId);
  const [metrics, gym] = await Promise.all([
    getDashboardMetrics(user.gymId),
    getGym(user.gymId),
  ]);

  const currency = gym?.currency === 'INR' ? '₹' : (gym?.currency ?? '₹');
  const fmt = (n: number) => `${currency}${n.toLocaleString('en-IN')}`;

  return (
    <AppLayout role="GYM_OWNER" gymName={gym?.name} userName={user.name} title="Dashboard">
      <div className="space-y-6">
        {/* Collection cards */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Collection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard title="Today's Collection" value={fmt(metrics.todayCollection)} icon={<IndianRupee className="h-5 w-5" />} valueClassName="text-green-600" />
            <MetricCard title="This Month's Collection" value={fmt(metrics.monthlyCollection)} icon={<TrendingUp className="h-5 w-5" />} valueClassName="text-blue-600" />
            <MetricCard title="Pending Payments" value={metrics.pendingPaymentsCount} icon={<Bell className="h-5 w-5" />} valueClassName="text-red-500" />
          </div>
        </div>

        {/* Member stats */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Members</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard title="Total Members" value={metrics.totalMembers} icon={<Users className="h-5 w-5" />} />
            <MetricCard title="Active / No Dues" value={metrics.membersWithNoDues} icon={<UserCheck className="h-5 w-5" />} valueClassName="text-green-600" />
            <MetricCard title="Expired / Dues" value={metrics.membersWithDues} icon={<UserX className="h-5 w-5" />} valueClassName="text-red-500" />
            <MetricCard title="Expiring Soon (≤7 days)" value={metrics.expiringSoonMembers} icon={<CalendarDays className="h-5 w-5" />} valueClassName="text-yellow-600" />
            <MetricCard title="New Members Today" value={metrics.newMembersToday} icon={<UserPlus className="h-5 w-5" />} />
            <MetricCard title="New This Month" value={metrics.newMembersThisMonth} icon={<UserPlus className="h-5 w-5" />} />
          </div>
        </div>

        {/* Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CollectionChart data={metrics.last7DaysCollection} />
        </div>
      </div>
    </AppLayout>
  );
}

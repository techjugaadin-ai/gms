import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { getAdminDashboard } from '@/lib/services/admin.service';
import { AppLayout } from '@/components/layout/AppLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Building2, Users, IndianRupee, AlertTriangle, CheckCircle, XCircle, Plus } from 'lucide-react';

export default async function SuperAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/');
  if (user.role !== 'SUPER_ADMIN') redirect('/');

  const metrics = await getAdminDashboard();

  return (
    <AppLayout role="SUPER_ADMIN" userName={user.name} title="Super Admin Dashboard">
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Gyms</h2>
            <Link href="/super-admin/onboard-gym">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                <Plus className="h-4 w-4" />
                Onboard New Gym
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard title="Total Gyms" value={metrics.totalGyms} icon={<Building2 className="h-5 w-5" />} />
            <MetricCard title="Active Gyms" value={metrics.activeGyms} icon={<CheckCircle className="h-5 w-5" />} valueClassName="text-green-600" />
            <MetricCard title="Suspended Gyms" value={metrics.suspendedGyms} icon={<XCircle className="h-5 w-5" />} valueClassName="text-red-500" />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Revenue & Members</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard title="Total Members" value={metrics.totalMembers} icon={<Users className="h-5 w-5" />} />
            <MetricCard title="Total Revenue" value={`₹${metrics.totalRevenue.toLocaleString('en-IN')}`} icon={<IndianRupee className="h-5 w-5" />} valueClassName="text-green-600" />
            <MetricCard title="Paid Gyms" value={metrics.paidGyms} icon={<CheckCircle className="h-5 w-5" />} valueClassName="text-green-600" />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Subscriptions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard title="Expiring (7 days)" value={metrics.subscriptionsExpiringSoon} icon={<AlertTriangle className="h-5 w-5" />} valueClassName="text-yellow-600" />
            <MetricCard title="Expired Subscriptions" value={metrics.expiredSubscriptions} icon={<XCircle className="h-5 w-5" />} valueClassName="text-red-500" />
            <MetricCard title="Pending Payments" value={metrics.pendingPaymentGyms} icon={<AlertTriangle className="h-5 w-5" />} valueClassName="text-orange-500" />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

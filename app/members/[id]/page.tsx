import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { getMemberWithPayments } from '@/lib/services/member.service';
import { getGym } from '@/lib/services/gym.service';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/Badge';
import { getMembershipStatus, formatDate } from '@/lib/utils/date';
import type { MembershipStatus } from '@/types/member';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Pencil } from 'lucide-react';

const statusBadge: Record<MembershipStatus, { variant: 'green' | 'yellow' | 'red'; label: string }> = {
  ACTIVE: { variant: 'green', label: 'Active' },
  EXPIRING_SOON: { variant: 'yellow', label: 'Expiring Soon' },
  EXPIRED: { variant: 'red', label: 'Expired' },
};

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER' || !user.gymId) redirect('/');

  let memberData;
  let gym = null;
  try {
    memberData = await getMemberWithPayments(id, user.gymId);
    gym = await getGym(user.gymId);
  } catch {
    redirect('/members');
  }

  const { member, payments, plan } = memberData;
  const status = getMembershipStatus(member.membershipEndDate);
  const badge = statusBadge[status];

  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  return (
    <AppLayout role="GYM_OWNER" gymName={gym?.name} userName={user.name} title="Member Detail">
      <div className="max-w-3xl space-y-6">
        {/* Back + actions */}
        <div className="flex items-center justify-between">
          <Link href="/members">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <Link href={`/members/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          </Link>
        </div>

        {/* Member info */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{member.name}</h2>
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">{member.id}</p>
            </div>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div><dt className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">Phone</dt><dd className="text-sm font-medium text-gray-800 dark:text-slate-200">{member.phone}</dd></div>
            <div><dt className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">Gender</dt><dd className="text-sm font-medium text-gray-800 dark:text-slate-200 capitalize">{member.gender}</dd></div>
            <div><dt className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">Referral Code</dt><dd className="text-sm font-mono font-medium text-gray-800 dark:text-slate-200">{member.referralCode}</dd></div>
            <div><dt className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">Joining Date</dt><dd className="text-sm font-medium text-gray-800 dark:text-slate-200">{formatDate(member.joiningDate)}</dd></div>
            {member.email && <div><dt className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">Email</dt><dd className="text-sm font-medium text-gray-800 dark:text-slate-200">{member.email}</dd></div>}
            {member.emergencyContact && <div><dt className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">Emergency Contact</dt><dd className="text-sm font-medium text-gray-800 dark:text-slate-200">{member.emergencyContact}</dd></div>}
            {member.weight && <div><dt className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">Weight</dt><dd className="text-sm font-medium text-gray-800 dark:text-slate-200">{member.weight} kg</dd></div>}
            {member.height && <div><dt className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">Height</dt><dd className="text-sm font-medium text-gray-800 dark:text-slate-200">{member.height} cm</dd></div>}
          </dl>
          {member.medicalInfo && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">Medical Information</p>
              <p className="text-sm text-gray-700 dark:text-slate-300">{member.medicalInfo}</p>
            </div>
          )}
        </div>

        {/* Membership info */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-4">Membership</h3>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div><dt className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">Plan</dt><dd className="text-sm font-medium text-gray-800 dark:text-slate-200">{plan?.name ?? member.membershipPlanId}</dd></div>
            <div><dt className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">Start Date</dt><dd className="text-sm font-medium text-gray-800 dark:text-slate-200">{formatDate(member.membershipStartDate)}</dd></div>
            <div><dt className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">End Date</dt><dd className="text-sm font-medium text-gray-800 dark:text-slate-200">{formatDate(member.membershipEndDate)}</dd></div>
          </dl>
        </div>

        {/* Payment history */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-4">Payment History</h3>
          {sortedPayments.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-slate-500">No payments recorded.</p>
          ) : (
            <div className="space-y-2">
              {sortedPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-slate-700 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-slate-200">{formatDate(p.paymentDate)}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{p.paymentType}</p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{p.amount.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

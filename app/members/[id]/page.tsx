import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { getMemberWithPayments } from '@/lib/services/member.service';
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
  try {
    memberData = await getMemberWithPayments(id, user.gymId);
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
    <AppLayout role="GYM_OWNER" title="Member Detail">
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
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{member.name}</h2>
              <p className="text-sm text-gray-400">{member.id}</p>
            </div>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div><dt className="text-gray-400">Phone</dt><dd className="font-medium">{member.phone}</dd></div>
            <div><dt className="text-gray-400">Gender</dt><dd className="font-medium capitalize">{member.gender}</dd></div>
            <div><dt className="text-gray-400">Referral Code</dt><dd className="font-mono font-medium">{member.referralCode}</dd></div>
            <div><dt className="text-gray-400">Joining Date</dt><dd className="font-medium">{formatDate(member.joiningDate)}</dd></div>
            {member.email && <div><dt className="text-gray-400">Email</dt><dd className="font-medium">{member.email}</dd></div>}
            {member.phone && <div><dt className="text-gray-400">Emergency Contact</dt><dd className="font-medium">{member.emergencyContact ?? '—'}</dd></div>}
            {member.weight && <div><dt className="text-gray-400">Weight</dt><dd className="font-medium">{member.weight} kg</dd></div>}
            {member.height && <div><dt className="text-gray-400">Height</dt><dd className="font-medium">{member.height} cm</dd></div>}
          </dl>
          {member.medicalInfo && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Medical Information</p>
              <p className="text-sm text-gray-700">{member.medicalInfo}</p>
            </div>
          )}
        </div>

        {/* Membership info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Membership</h3>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div><dt className="text-gray-400">Plan</dt><dd className="font-medium">{plan?.name ?? member.membershipPlanId}</dd></div>
            <div><dt className="text-gray-400">Start Date</dt><dd className="font-medium">{formatDate(member.membershipStartDate)}</dd></div>
            <div><dt className="text-gray-400">End Date</dt><dd className="font-medium">{formatDate(member.membershipEndDate)}</dd></div>
          </dl>
        </div>

        {/* Payment history */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Payment History</h3>
          {sortedPayments.length === 0 ? (
            <p className="text-sm text-gray-400">No payments recorded.</p>
          ) : (
            <div className="space-y-3">
              {sortedPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatDate(p.paymentDate)}</p>
                    <p className="text-xs text-gray-400">{p.paymentType}</p>
                  </div>
                  <p className="text-sm font-semibold text-green-600">
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

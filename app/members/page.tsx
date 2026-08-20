'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { getMembershipStatus, formatDate } from '@/lib/utils/date';
import type { Member } from '@/types/member';
import type { MembershipPlan } from '@/types/membership-plan';
import type { MembershipStatus } from '@/types/member';
import { Eye, Pencil, CreditCard, Trash2, UserPlus } from 'lucide-react';
import { PaymentForm } from '@/components/payments/PaymentForm';

const statusBadge: Record<MembershipStatus, { variant: 'green' | 'yellow' | 'red'; label: string }> = {
  ACTIVE: { variant: 'green', label: 'Active' },
  EXPIRING_SOON: { variant: 'yellow', label: 'Expiring Soon' },
  EXPIRED: { variant: 'red', label: 'Expired' },
};

export default function MembersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);

  const fetchData = useCallback(async () => {
    const [mRes, pRes] = await Promise.all([
      fetch('/api/members', { credentials: 'include' }),
      fetch('/api/membership-plans', { credentials: 'include' }),
    ]);
    const [mData, pData] = await Promise.all([mRes.json(), pRes.json()]);
    if (mData.success) setMembers(mData.data);
    if (pData.success) setPlans(pData.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.phone.includes(search)
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/members/${deleteTarget.id}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json();
    if (data.success) {
      toast('success', 'Member removed');
      setDeleteTarget(null);
      fetchData();
    } else {
      toast('error', data.error?.message ?? 'Failed to delete');
    }
  };

  const getPlanName = (planId: string) => plans.find((p) => p.id === planId)?.name ?? planId;

  return (
    <AppLayout role="GYM_OWNER" title="Members">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-72"
          />
          <Link href="/members/new">
            <Button>
              <UserPlus className="h-4 w-4" />
              Add Member
            </Button>
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Phone', 'Plan', 'Expiry', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">No members found</td></tr>
                ) : (
                  filtered.map((m) => {
                    const status = getMembershipStatus(m.membershipEndDate);
                    const badge = statusBadge[status];
                    return (
                      <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{m.name}</p>
                            <p className="text-xs text-gray-400">{m.id}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{m.phone}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{getPlanName(m.membershipPlanId)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(m.membershipEndDate)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link href={`/members/${m.id}`}>
                              <button className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="View">
                                <Eye className="h-4 w-4 text-gray-500" />
                              </button>
                            </Link>
                            <Link href={`/members/${m.id}/edit`}>
                              <button className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Edit">
                                <Pencil className="h-4 w-4 text-gray-500" />
                              </button>
                            </Link>
                            <button
                              className="p-1.5 rounded hover:bg-blue-50 transition-colors"
                              title="Record Payment"
                              onClick={() => setPaymentModal(m)}
                            >
                              <CreditCard className="h-4 w-4 text-blue-500" />
                            </button>
                            <button
                              className="p-1.5 rounded hover:bg-red-50 transition-colors"
                              title="Delete"
                              onClick={() => setDeleteTarget(m)}
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {!loading && (
            <div className="px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">{filtered.length} member{filtered.length !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment modal */}
      <Modal open={!!paymentModal} onClose={() => setPaymentModal(null)} title="Record Payment">
        {paymentModal && (
          <PaymentForm
            memberId={paymentModal.id}
            memberName={paymentModal.name}
            currentPlanId={paymentModal.membershipPlanId}
            plans={plans}
            onSuccess={() => { setPaymentModal(null); fetchData(); toast('success', 'Payment recorded'); }}
            onCancel={() => setPaymentModal(null)}
          />
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Member">
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to remove <strong>{deleteTarget?.name}</strong>? This action can be undone by an admin.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Remove</Button>
        </div>
      </Modal>
    </AppLayout>
  );
}

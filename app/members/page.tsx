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
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { getMembershipStatus, formatDate } from '@/lib/utils/date';
import type { Member } from '@/types/member';
import type { MembershipPlan } from '@/types/membership-plan';
import type { MembershipStatus } from '@/types/member';
import { Eye, Pencil, CreditCard, Trash2, UserPlus, ChevronDown } from 'lucide-react';
import { PaymentForm } from '@/components/payments/PaymentForm';

const statusBadge: Record<MembershipStatus, { variant: 'green' | 'yellow' | 'red'; label: string }> = {
  ACTIVE: { variant: 'green', label: 'Active' },
  EXPIRING_SOON: { variant: 'yellow', label: 'Expiring Soon' },
  EXPIRED: { variant: 'red', label: 'Expired' },
};

export default function MembersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, gym } = useUserInfo();
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [search, setSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState({ name: '', phone: '', plan: '', expiry: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
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

  const filtered = members.filter((m) => {
    const status = getMembershipStatus(m.membershipEndDate);
    const planName = getPlanName(m.membershipPlanId);
    const matchesSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search);
    const matchesName = !columnFilters.name || m.name.toLowerCase().includes(columnFilters.name.toLowerCase());
    const matchesPhone = !columnFilters.phone || m.phone.includes(columnFilters.phone);
    const matchesPlan = !columnFilters.plan || m.membershipPlanId === columnFilters.plan;
    const matchesExpiry = !columnFilters.expiry || (
      columnFilters.expiry === 'expired' ? status === 'EXPIRED' :
      columnFilters.expiry === 'expiring' ? status === 'EXPIRING_SOON' :
      status === 'ACTIVE'
    );
    const matchesStatus = !columnFilters.status || status === columnFilters.status;
    return matchesSearch && matchesName && matchesPhone && matchesPlan && matchesExpiry && matchesStatus && Boolean(planName);
  });

  const updateColumnFilter = (field: keyof typeof columnFilters, value: string) => {
    setColumnFilters((current) => ({ ...current, [field]: value }));
  };

  return (
    <AppLayout role="GYM_OWNER" gymName={gym?.name} userName={user?.name} title="Members">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72"
          />
          <Link href="/members/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto gap-1.5">
              <UserPlus className="h-4 w-4" />
              Add Member
            </Button>
          </Link>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                  {['Name', 'Phone', 'Plan', 'Expiry', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <th className="px-3 py-2"><input aria-label="Filter by name" placeholder="Filter name" value={columnFilters.name} onChange={(e) => updateColumnFilter('name', e.target.value)} className="h-8 w-full min-w-24 rounded-md border border-gray-300 bg-white px-2 text-xs font-normal normal-case text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200" /></th>
                  <th className="px-3 py-2"><input aria-label="Filter by phone" placeholder="Filter phone" value={columnFilters.phone} onChange={(e) => updateColumnFilter('phone', e.target.value)} className="h-8 w-full min-w-24 rounded-md border border-gray-300 bg-white px-2 text-xs font-normal normal-case text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200" /></th>
                  <th className="px-3 py-2">
                    <select aria-label="Filter by plan" value={columnFilters.plan} onChange={(e) => updateColumnFilter('plan', e.target.value)} className="h-8 w-full min-w-28 rounded-md border border-gray-300 bg-white px-2 text-xs font-normal normal-case text-gray-700 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
                      <option value="">All plans</option>
                      {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
                    </select>
                  </th>
                  <th className="px-3 py-2">
                    <select aria-label="Filter by expiry" value={columnFilters.expiry} onChange={(e) => updateColumnFilter('expiry', e.target.value)} className="h-8 w-full min-w-28 rounded-md border border-gray-300 bg-white px-2 text-xs font-normal normal-case text-gray-700 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
                      <option value="">All expiry</option>
                      <option value="active">Active</option>
                      <option value="expiring">Expiring soon</option>
                      <option value="expired">Expired</option>
                    </select>
                  </th>
                  <th className="px-3 py-2">
                    <select aria-label="Filter by status" value={columnFilters.status} onChange={(e) => updateColumnFilter('status', e.target.value)} className="h-8 w-full min-w-28 rounded-md border border-gray-300 bg-white px-2 text-xs font-normal normal-case text-gray-700 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
                      <option value="">All status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="EXPIRING_SOON">Expiring soon</option>
                      <option value="EXPIRED">Expired</option>
                    </select>
                  </th>
                  <th className="px-3 py-2 text-xs font-normal normal-case text-gray-400">-</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400 dark:text-slate-500">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400 dark:text-slate-500">No members found</td></tr>
                ) : (
                  filtered.map((m) => {
                    const status = getMembershipStatus(m.membershipEndDate);
                    const badge = statusBadge[status];
                    return (
                      <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{m.name}</p>
                          <p className="text-xs text-gray-400 dark:text-slate-500">{m.id}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300">{m.phone}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300">{getPlanName(m.membershipPlanId)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300">{formatDate(m.membershipEndDate)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link href={`/members/${m.id}`}>
                              <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="View">
                                <Eye className="h-[22px] w-[22px]" />
                              </button>
                            </Link>
                            <Link href={`/members/${m.id}/edit`}>
                              <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors" title="Edit">
                                <Pencil className="h-[22px] w-[22px]" />
                              </button>
                            </Link>
                            <button
                              className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                              title="Record Payment"
                              onClick={() => setPaymentModal(m)}
                            >
                              <CreditCard className="h-[22px] w-[22px]" />
                            </button>
                            <button
                              className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                              title="Delete"
                              onClick={() => setDeleteTarget(m)}
                            >
                              <Trash2 className="h-[22px] w-[22px]" />
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
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
              <p className="text-xs text-gray-500 dark:text-slate-400">{filtered.length} member{filtered.length !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>

        {/* Mobile Filters */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="w-full bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Filters</span>
            <ChevronDown className={`h-5 w-5 text-gray-500 dark:text-slate-400 transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {mobileFiltersOpen && (
            <div className="space-y-2 bg-white dark:bg-slate-800 rounded-b-xl border border-t-0 border-gray-200 dark:border-slate-700 p-3 mt-0">
              <input aria-label="Filter by name" placeholder="Filter name" value={columnFilters.name} onChange={(e) => updateColumnFilter('name', e.target.value)} className="w-full h-8 rounded-md border border-gray-300 bg-white px-2 text-xs font-normal text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200" />
              <input aria-label="Filter by phone" placeholder="Filter phone" value={columnFilters.phone} onChange={(e) => updateColumnFilter('phone', e.target.value)} className="w-full h-8 rounded-md border border-gray-300 bg-white px-2 text-xs font-normal text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200" />
              <select aria-label="Filter by plan" value={columnFilters.plan} onChange={(e) => updateColumnFilter('plan', e.target.value)} className="w-full h-8 rounded-md border border-gray-300 bg-white px-2 text-xs font-normal text-gray-700 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
                <option value="">All plans</option>
                {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
              </select>
              <select aria-label="Filter by expiry" value={columnFilters.expiry} onChange={(e) => updateColumnFilter('expiry', e.target.value)} className="w-full h-8 rounded-md border border-gray-300 bg-white px-2 text-xs font-normal text-gray-700 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
                <option value="">All expiry</option>
                <option value="active">Active</option>
                <option value="expiring">Expiring soon</option>
                <option value="expired">Expired</option>
              </select>
              <select aria-label="Filter by status" value={columnFilters.status} onChange={(e) => updateColumnFilter('status', e.target.value)} className="w-full h-8 rounded-md border border-gray-300 bg-white px-2 text-xs font-normal text-gray-700 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
                <option value="">All status</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRING_SOON">Expiring soon</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="text-center py-10 text-sm text-gray-400 dark:text-slate-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-400 dark:text-slate-500">No members found</div>
          ) : (
            filtered.map((m) => {
              const status = getMembershipStatus(m.membershipEndDate);
              const badge = statusBadge[status];
              return (
                <div key={m.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{m.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{m.phone}</p>
                    </div>
                    <Badge variant={badge.variant} className="flex-shrink-0">{badge.label}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-400 dark:text-slate-500 mb-0.5">Plan</p>
                      <p className="font-medium text-gray-800 dark:text-slate-200 truncate">{getPlanName(m.membershipPlanId)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 dark:text-slate-500 mb-0.5">Expiry</p>
                      <p className="font-medium text-gray-800 dark:text-slate-200">{formatDate(m.membershipEndDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                    <Link href={`/members/${m.id}`} className="flex-1">
                      <button className="w-full h-8 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors flex items-center justify-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </Link>
                    <Link href={`/members/${m.id}/edit`} className="flex-1">
                      <button className="w-full h-8 text-xs font-medium text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center justify-center gap-1">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                    </Link>
                    <button
                      className="flex-1 h-8 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors flex items-center justify-center gap-1"
                      onClick={() => setPaymentModal(m)}
                    >
                      <CreditCard className="h-3.5 w-3.5" /> Pay
                    </button>
                    <button
                      className="flex items-center justify-center w-8 h-8 text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      onClick={() => setDeleteTarget(m)}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
          {!loading && filtered.length > 0 && (
            <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-2">{filtered.length} member{filtered.length !== 1 ? 's' : ''}</p>
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
        <p className="text-sm text-gray-600 dark:text-slate-300 mb-5">
          Are you sure you want to remove <strong className="text-gray-900 dark:text-white">{deleteTarget?.name}</strong>?
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Remove</Button>
        </div>
      </Modal>
    </AppLayout>
  );
}

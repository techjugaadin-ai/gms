'use client';
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/Badge';
import { DateInput } from '@/components/ui/DateInput';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { getMembershipStatus, formatDate, isToday, isInCurrentMonth } from '@/lib/utils/date';
import type { Member } from '@/types/member';
import type { Payment } from '@/types/payment';
import type { MembershipPlan } from '@/types/membership-plan';
import type { MembershipStatus } from '@/types/member';

const statusBadge: Record<MembershipStatus, { variant: 'green' | 'yellow' | 'red'; label: string }> = {
  ACTIVE: { variant: 'green', label: 'Active' },
  EXPIRING_SOON: { variant: 'yellow', label: 'Expiring Soon' },
  EXPIRED: { variant: 'red', label: 'Expired' },
};

type DateFilter = 'today' | 'week' | 'month' | 'custom';

export default function ReportsPage() {
  const { user, gym } = useUserInfo();
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DateFilter>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/members', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/payments', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/membership-plans', { credentials: 'include' }).then((r) => r.json()),
    ]).then(([m, p, pl]) => {
      if (m.success) setMembers(m.data);
      if (p.success) setPayments(p.data);
      if (pl.success) setPlans(pl.data);
      setLoading(false);
    });
  }, []);

  const inRange = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (filter === 'today') return isToday(dateStr);
    if (filter === 'month') return isInCurrentMonth(dateStr);
    if (filter === 'week') {
      const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo && d <= today;
    }
    if (filter === 'custom' && customStart && customEnd) {
      return d >= new Date(customStart) && d <= new Date(customEnd);
    }
    return true;
  };

  const filteredPayments = payments.filter((p) => inRange(p.paymentDate));
  const collection = filteredPayments.reduce((s, p) => s + p.amount, 0);

  const activeMembers = members.filter((m) => getMembershipStatus(m.membershipEndDate) === 'ACTIVE');
  const expiringSoon = members.filter((m) => getMembershipStatus(m.membershipEndDate) === 'EXPIRING_SOON');
  const expired = members.filter((m) => getMembershipStatus(m.membershipEndDate) === 'EXPIRED');

  const getPlanName = (id: string) => plans.find((p) => p.id === id)?.name ?? id;

  return (
    <AppLayout role="GYM_OWNER" gymName={gym?.name} userName={user?.name} title="Reports">
      <div className="space-y-6">
        {/* Date filter */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 overflow-hidden">
          <div className="flex flex-wrap gap-2">
            {(['today', 'week', 'month', 'custom'] as DateFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {f === 'today' ? 'Today' : f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : 'Custom'}
              </button>
            ))}
            {filter === 'custom' && (
              <div className="flex flex-col sm:flex-row gap-2 w-full mt-1">
                <DateInput id="customStart" value={customStart} onChange={setCustomStart} className="flex-1 min-w-0" />
                <DateInput id="customEnd" value={customEnd} onChange={setCustomEnd} className="flex-1 min-w-0" />
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 text-center">
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Collection</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{collection.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 text-center">
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Total Members</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{members.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 text-center">
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Active</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeMembers.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 text-center">
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Expired</p>
            <p className="text-2xl font-bold text-red-500 dark:text-red-400">{expired.length}</p>
          </div>
        </div>

        {/* Expiring soon */}
        {expiringSoon.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400">Expiring Soon ({expiringSoon.length})</h3>
            </div>

            {/* Desktop table */}
            <table className="hidden sm:table min-w-full">
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {expiringSoon.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-slate-100">{m.name}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500 dark:text-slate-400">{getPlanName(m.membershipPlanId)}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500 dark:text-slate-400">{formatDate(m.membershipEndDate)}</td>
                    <td className="px-4 py-2.5"><Badge variant="yellow">Expiring Soon</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100 dark:divide-slate-700">
              {expiringSoon.map((m) => (
                <div key={m.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{m.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{getPlanName(m.membershipPlanId)}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{formatDate(m.membershipEndDate)}</p>
                  </div>
                  <Badge variant="yellow" className="flex-shrink-0">Expiring</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payments in range */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">Payments ({filteredPayments.length})</h3>
          </div>
          {filteredPayments.length === 0 ? (
            <p className="px-4 py-8 text-sm text-gray-400 dark:text-slate-500 text-center">No payments in this period</p>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  {['Date', 'Member', 'Amount', 'Type'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filteredPayments.map((p) => {
                  const m = members.find((x) => x.id === p.memberId);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                      <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-slate-300">{formatDate(p.paymentDate)}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100">{m?.name ?? p.memberId}</td>
                      <td className="px-4 py-2.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">₹{p.amount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-500 dark:text-slate-400">{p.paymentType}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

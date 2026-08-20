'use client';
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/Badge';
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
    <AppLayout role="GYM_OWNER" title="Reports">
      <div className="space-y-6">
        {/* Date filter */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-wrap gap-2 items-center">
            {(['today', 'week', 'month', 'custom'] as DateFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {f === 'today' ? 'Today' : f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : 'Custom'}
              </button>
            ))}
            {filter === 'custom' && (
              <div className="flex gap-2 items-center">
                <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" />
                <span className="text-gray-400">–</span>
                <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" />
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-xs text-gray-400 mb-1">Collection</p>
            <p className="text-2xl font-bold text-green-600">₹{collection.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-xs text-gray-400 mb-1">Total Members</p>
            <p className="text-2xl font-bold text-gray-900">{members.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-xs text-gray-400 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-600">{activeMembers.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-xs text-gray-400 mb-1">Expired</p>
            <p className="text-2xl font-bold text-red-500">{expired.length}</p>
          </div>
        </div>

        {/* Expiring soon */}
        {expiringSoon.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-yellow-700">Expiring Soon ({expiringSoon.length})</h3>
            </div>
            <table className="min-w-full">
              <tbody className="divide-y divide-gray-50">
                {expiringSoon.map((m) => (
                  <tr key={m.id} className="px-4 py-3">
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{m.name}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500">{getPlanName(m.membershipPlanId)}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500">{formatDate(m.membershipEndDate)}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="yellow">Expiring Soon</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payments in range */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Payments ({filteredPayments.length})</h3>
          </div>
          {filteredPayments.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">No payments in this period</p>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Date', 'Member', 'Amount', 'Type'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPayments.map((p) => {
                  const m = members.find((x) => x.id === p.memberId);
                  return (
                    <tr key={p.id}>
                      <td className="px-4 py-2.5 text-sm text-gray-600">{formatDate(p.paymentDate)}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-900">{m?.name ?? p.memberId}</td>
                      <td className="px-4 py-2.5 text-sm font-semibold text-green-600">₹{p.amount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-500">{p.paymentType}</td>
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

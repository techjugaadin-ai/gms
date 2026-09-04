'use client';
import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { useToast } from '@/components/ui/Toast';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { formatDate } from '@/lib/utils/date';
import type { Payment } from '@/types/payment';
import type { MembershipPlan } from '@/types/membership-plan';
import type { Member } from '@/types/member';
import { Plus } from 'lucide-react';

const typeColors: Record<string, 'green' | 'blue' | 'gray' | 'orange' | 'yellow'> = {
  Cash: 'green', UPI: 'blue', Card: 'orange', 'Bank Transfer': 'gray', Other: 'yellow',
};

export default function PaymentsPage() {
  const { toast } = useToast();
  const { user, gym } = useUserInfo();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const fetchData = useCallback(async () => {
    const [pRes, mRes, plRes] = await Promise.all([
      fetch('/api/payments', { credentials: 'include' }),
      fetch('/api/members', { credentials: 'include' }),
      fetch('/api/membership-plans', { credentials: 'include' }),
    ]);
    const [pData, mData, plData] = await Promise.all([pRes.json(), mRes.json(), plRes.json()]);
    if (pData.success) setPayments(pData.data.sort((a: Payment, b: Payment) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()));
    if (mData.success) setMembers(mData.data);
    if (plData.success) setPlans(plData.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getMemberName = (id: string) => members.find((m) => m.id === id)?.name ?? id;
  const getPlanName = (id: string) => plans.find((p) => p.id === id)?.name ?? id;
  const selectedMember = members.find((m) => m.id === selectedMemberId);

  return (
    <AppLayout role="GYM_OWNER" gymName={gym?.name} userName={user?.name} title="Payments">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setModal(true)}>
            <Plus className="h-4 w-4" /> Record Payment
          </Button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                  {['Date', 'Member', 'Plan', 'Amount', 'Type'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400 dark:text-slate-500">Loading...</td></tr>
                ) : payments.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400 dark:text-slate-500">No payments yet</td></tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300">{formatDate(p.paymentDate)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-slate-100">{getMemberName(p.memberId)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300">{getPlanName(p.planId)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">₹{p.amount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <Badge variant={typeColors[p.paymentType] ?? 'gray'}>{p.paymentType}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="text-center py-10 text-sm text-gray-400 dark:text-slate-500">Loading...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-400 dark:text-slate-500">No payments yet</div>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{getMemberName(p.memberId)}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{formatDate(p.paymentDate)}</p>
                  </div>
                  <Badge variant={typeColors[p.paymentType] ?? 'gray'} className="flex-shrink-0">{p.paymentType}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-400 dark:text-slate-500 mb-0.5">Plan</p>
                    <p className="font-medium text-gray-800 dark:text-slate-200 truncate">{getPlanName(p.planId)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-slate-500 mb-0.5">Amount</p>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">₹{p.amount.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Record Payment">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Select Member *</label>
          <select
            className="block w-full h-9 rounded-lg border border-gray-300 dark:border-slate-600 px-3 text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            required
          >
            <option value="">Choose member...</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        {selectedMember && (
          <PaymentForm
            memberId={selectedMember.id}
            memberName={selectedMember.name}
            currentPlanId={selectedMember.membershipPlanId}
            plans={plans}
            onSuccess={() => { setModal(false); setSelectedMemberId(''); fetchData(); toast('success', 'Payment recorded'); }}
            onCancel={() => setModal(false)}
          />
        )}
      </Modal>
    </AppLayout>
  );
}

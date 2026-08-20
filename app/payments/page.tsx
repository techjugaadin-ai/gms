'use client';
import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { useToast } from '@/components/ui/Toast';
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
    <AppLayout role="GYM_OWNER" title="Payments">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setModal(true)}>
            <Plus className="h-4 w-4" /> Record Payment
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Date', 'Member', 'Plan', 'Amount', 'Type'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">Loading...</td></tr>
                ) : payments.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">No payments yet</td></tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(p.paymentDate)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{getMemberName(p.memberId)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{getPlanName(p.planId)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600">₹{p.amount.toLocaleString('en-IN')}</td>
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
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Record Payment">
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">Select Member</label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
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

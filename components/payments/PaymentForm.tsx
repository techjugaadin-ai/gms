'use client';
import { useState } from 'react';
import { Input, Select } from '@/components/ui/Input';
import { DateInput } from '@/components/ui/DateInput';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { MembershipPlan } from '@/types/membership-plan';
import { calculateSubscriptionEndDate, getTodayISODate } from '@/lib/utils/subscription';

interface PaymentFormProps {
  memberId: string;
  memberName: string;
  currentPlanId: string;
  plans: MembershipPlan[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentForm({ memberId, memberName, currentPlanId, plans, onSuccess, onCancel }: PaymentFormProps) {
  const { toast } = useToast();
  const activePlans = plans.filter((p) => p.active);
  const [planId, setPlanId] = useState(currentPlanId);
  const selectedPlan = activePlans.find((p) => p.id === planId);
  const [amount, setAmount] = useState(selectedPlan?.price ?? 0);
  const [paymentDate, setPaymentDate] = useState(getTodayISODate());
  const [membershipStartDate, setMembershipStartDate] = useState(getTodayISODate());
  const [membershipEndDate, setMembershipEndDate] = useState(
    selectedPlan ? calculateSubscriptionEndDate(getTodayISODate(), selectedPlan.durationMonths) : '',
  );
  const [paymentType, setPaymentType] = useState<string>('UPI');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePlanChange = (pid: string) => {
    setPlanId(pid);
    const plan = activePlans.find((p) => p.id === pid);
    if (plan) {
      setAmount(plan.price);
      setMembershipEndDate(calculateSubscriptionEndDate(membershipStartDate, plan.durationMonths));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ memberId, planId, amount, paymentDate, paymentType, notes, membershipStartDate, membershipEndDate }),
      });
      const data = await res.json();
      if (!data.success) {
        toast('error', data.error?.message ?? 'Payment failed');
        return;
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-700 dark:text-slate-300">Recording payment for <strong className="text-gray-900 dark:text-white">{memberName}</strong></p>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Plan</label>
        <select
          className="block w-full h-9 rounded-lg border border-gray-300 dark:border-slate-600 px-3 text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={planId}
          onChange={(e) => handlePlanChange(e.target.value)}
          required
        >
          {activePlans.map((p) => (
            <option key={p.id} value={p.id}>{p.name} — ₹{p.price.toLocaleString('en-IN')}</option>
          ))}
        </select>
      </div>

      <Input
        label="Amount (₹)"
        id="amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(parseFloat(e.target.value))}
        min={1}
        required
      />
      <DateInput
        label="Payment Date"
        id="paymentDate"
        value={paymentDate}
        onChange={setPaymentDate}
        required
      />
      <DateInput
        label="Membership Start Date"
        id="membershipStartDate"
        value={membershipStartDate}
        onChange={(value) => {
          setMembershipStartDate(value);
          if (selectedPlan) setMembershipEndDate(calculateSubscriptionEndDate(value, selectedPlan.durationMonths));
        }}
        required
      />
      <DateInput
        label="Membership End Date"
        id="membershipEndDate"
        value={membershipEndDate}
        onChange={setMembershipEndDate}
        required
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Payment Type</label>
        <select
          className="block w-full h-9 rounded-lg border border-gray-300 dark:border-slate-600 px-3 text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
        >
          {['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <Input
        label="Notes (optional)"
        id="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>Record Payment</Button>
      </div>
    </form>
  );
}

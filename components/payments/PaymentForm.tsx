'use client';
import { useState } from 'react';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { MembershipPlan } from '@/types/membership-plan';

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
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentType, setPaymentType] = useState<string>('UPI');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePlanChange = (pid: string) => {
    setPlanId(pid);
    const plan = activePlans.find((p) => p.id === pid);
    if (plan) setAmount(plan.price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ memberId, planId, amount, paymentDate, paymentType, notes }),
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
      <p className="text-sm text-gray-500">Recording payment for <strong>{memberName}</strong></p>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Plan</label>
        <select
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
      <Input
        label="Payment Date"
        id="paymentDate"
        type="date"
        value={paymentDate}
        onChange={(e) => setPaymentDate(e.target.value)}
        required
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Payment Type</label>
        <select
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>Record Payment</Button>
      </div>
    </form>
  );
}

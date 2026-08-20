'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { MembershipPlan } from '@/types/membership-plan';
import type { CreateMemberInput } from '@/lib/validation/schemas';

interface MemberFormProps {
  initialValues?: Partial<CreateMemberInput>;
  memberId?: string;
  onSuccess?: () => void;
  mode: 'create' | 'edit';
}

export function MemberForm({ initialValues, memberId, onSuccess, mode }: MemberFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<CreateMemberInput>>({
    joiningDate: new Date().toISOString().split('T')[0],
    gender: 'male',
    ...initialValues,
  });

  useEffect(() => {
    fetch('/api/membership-plans', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (d.success) setPlans(d.data.filter((p: MembershipPlan) => p.active)); });
  }, []);

  const set = (field: keyof CreateMemberInput, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = mode === 'create' ? '/api/members' : `/api/members/${memberId}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        toast('error', data.error?.message ?? 'Failed');
        return;
      }
      toast('success', mode === 'create' ? 'Member added successfully' : 'Member updated');
      if (onSuccess) onSuccess();
      else router.push('/members');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Required Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name *" id="name" value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Gender *</label>
            <select
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={form.gender ?? 'male'}
              onChange={(e) => set('gender', e.target.value)}
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <Input label="Phone *" id="phone" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Membership Plan *</label>
            <select
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={form.membershipPlanId ?? ''}
              onChange={(e) => set('membershipPlanId', e.target.value)}
              required
            >
              <option value="">Select plan...</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — ₹{p.price.toLocaleString('en-IN')}/{p.durationMonths}mo</option>
              ))}
            </select>
          </div>
          <Input label="Joining Date *" id="joiningDate" type="date" value={form.joiningDate ?? ''} onChange={(e) => set('joiningDate', e.target.value)} required />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Optional Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Email" id="email" type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
          <Input label="Emergency Contact" id="emergencyContact" value={form.emergencyContact ?? ''} onChange={(e) => set('emergencyContact', e.target.value)} />
          <Input label="Weight (kg)" id="weight" type="number" value={form.weight ?? ''} onChange={(e) => set('weight', parseFloat(e.target.value))} />
          <Input label="Height (cm)" id="height" type="number" value={form.height ?? ''} onChange={(e) => set('height', parseFloat(e.target.value))} />
          <div className="sm:col-span-2">
            <Textarea label="Address" id="address" value={form.address ?? ''} onChange={(e) => set('address', e.target.value)} rows={2} />
          </div>
          <div className="sm:col-span-2">
            <Textarea label="Medical Information" id="medicalInfo" value={form.medicalInfo ?? ''} onChange={(e) => set('medicalInfo', e.target.value)} rows={2} />
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={() => router.push('/members')}>Cancel</Button>
        <Button type="submit" loading={loading}>
          {mode === 'create' ? 'Add Member' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { Gym } from '@/types/gym';

export default function SettingsPage() {
  const { toast } = useToast();
  const [gym, setGym] = useState<Partial<Gym>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/gym', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (d.success) setGym(d.data); setLoading(false); });
  }, []);

  const set = (field: keyof Gym, value: string) => setGym((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/gym', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: gym.name, phone: gym.phone, email: gym.email, address: gym.address, currency: gym.currency }),
    });
    const data = await res.json();
    if (data.success) {
      toast('success', 'Settings saved');
      setGym(data.data);
    } else {
      toast('error', data.error?.message ?? 'Failed to save');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <AppLayout role="GYM_OWNER" title="Settings">
        <p className="text-sm text-gray-400">Loading...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="GYM_OWNER" title="Settings">
      <div className="max-w-xl">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Gym Configuration</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Gym Name" id="name" value={gym.name ?? ''} onChange={(e) => set('name', e.target.value)} required />
            <Input label="Phone" id="phone" value={gym.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
            <Input label="Email" id="email" type="email" value={gym.email ?? ''} onChange={(e) => set('email', e.target.value)} />
            <Input label="Address" id="address" value={gym.address ?? ''} onChange={(e) => set('address', e.target.value)} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Currency</label>
              <select
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={gym.currency ?? 'INR'}
                onChange={(e) => set('currency', e.target.value)}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div className="pt-2">
              <Button type="submit" loading={saving}>Save Settings</Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

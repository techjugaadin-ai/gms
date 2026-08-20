'use client';
import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils/date';
import type { Gym } from '@/types/gym';
import { Eye, Ban, CheckCircle, RefreshCw } from 'lucide-react';

const statusBadge = (status: string) => status === 'active'
  ? { variant: 'green' as const, label: 'Active' }
  : { variant: 'red' as const, label: 'Suspended' };

const paymentBadge = (status: string): 'green' | 'red' | 'yellow' =>
  status === 'paid' ? 'green' : status === 'pending' ? 'yellow' : 'red';

export default function GymsPage() {
  const { toast } = useToast();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewTarget, setRenewTarget] = useState<Gym | null>(null);
  const [renewForm, setRenewForm] = useState({ subscriptionPlan: 'yearly', subscriptionStartDate: '', subscriptionEndDate: '', paymentStatus: 'paid', subscriptionAmount: 0 });
  const [saving, setSaving] = useState(false);

  const fetchGyms = useCallback(async () => {
    const res = await fetch('/api/admin/gyms', { credentials: 'include' });
    const data = await res.json();
    if (data.success) setGyms(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchGyms(); }, [fetchGyms]);

  const toggleStatus = async (gym: Gym) => {
    const newStatus = gym.status === 'active' ? 'suspended' : 'active';
    const res = await fetch(`/api/admin/gyms/${gym.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (data.success) { toast('success', `Gym ${newStatus}`); fetchGyms(); }
    else toast('error', 'Failed to update status');
  };

  const openRenew = (gym: Gym) => {
    const today = new Date().toISOString().split('T')[0];
    setRenewTarget(gym);
    setRenewForm({
      subscriptionPlan: gym.subscriptionPlan,
      subscriptionStartDate: today,
      subscriptionEndDate: '',
      paymentStatus: 'paid',
      subscriptionAmount: gym.subscriptionAmount,
    });
  };

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewTarget) return;
    setSaving(true);
    const res = await fetch(`/api/admin/gyms/${renewTarget.id}/subscription`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },      credentials: 'include',      body: JSON.stringify(renewForm),
    });
    const data = await res.json();
    if (data.success) { toast('success', 'Subscription updated'); setRenewTarget(null); fetchGyms(); }
    else toast('error', data.error?.message ?? 'Failed');
    setSaving(false);
  };

  return (
    <AppLayout role="SUPER_ADMIN" title="All Gyms">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Gym', 'Members', 'Subscription', 'Expiry', 'Payment', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">Loading...</td></tr>
              ) : (
                gyms.map((g) => {
                  const sb = statusBadge(g.status);
                  return (
                    <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{g.name}</p>
                        <p className="text-xs text-gray-400">{g.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">—</td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">{g.subscriptionPlan}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(g.subscriptionEndDate)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={paymentBadge(g.paymentStatus)} className="capitalize">{g.paymentStatus}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={sb.variant}>{sb.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                            title={g.status === 'active' ? 'Suspend' : 'Activate'}
                            onClick={() => toggleStatus(g)}
                          >
                            {g.status === 'active'
                              ? <Ban className="h-4 w-4 text-red-400" />
                              : <CheckCircle className="h-4 w-4 text-green-500" />}
                          </button>
                          <button
                            className="p-1.5 rounded hover:bg-blue-50 transition-colors"
                            title="Renew subscription"
                            onClick={() => openRenew(g)}
                          >
                            <RefreshCw className="h-4 w-4 text-blue-500" />
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
      </div>

      {/* Renew modal */}
      <Modal open={!!renewTarget} onClose={() => setRenewTarget(null)} title="Update Subscription">
        <form onSubmit={handleRenew} className="space-y-4">
          <p className="text-sm text-gray-500">Gym: <strong>{renewTarget?.name}</strong></p>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Plan</label>
            <select
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={renewForm.subscriptionPlan}
              onChange={(e) => setRenewForm((f) => ({ ...f, subscriptionPlan: e.target.value }))}
            >
              {['monthly', 'quarterly', 'half-yearly', 'yearly', 'custom'].map((p) => (
                <option key={p} value={p} className="capitalize">{p}</option>
              ))}
            </select>
          </div>
          <Input
            label="Start Date"
            id="subStart"
            type="date"
            value={renewForm.subscriptionStartDate}
            onChange={(e) => setRenewForm((f) => ({ ...f, subscriptionStartDate: e.target.value }))}
            required
          />
          <Input
            label="End Date"
            id="subEnd"
            type="date"
            value={renewForm.subscriptionEndDate}
            onChange={(e) => setRenewForm((f) => ({ ...f, subscriptionEndDate: e.target.value }))}
            required
          />
          <Input
            label="Amount (₹)"
            id="subAmount"
            type="number"
            value={renewForm.subscriptionAmount}
            onChange={(e) => setRenewForm((f) => ({ ...f, subscriptionAmount: parseFloat(e.target.value) }))}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Payment Status</label>
            <select
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={renewForm.paymentStatus}
              onChange={(e) => setRenewForm((f) => ({ ...f, paymentStatus: e.target.value }))}
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setRenewTarget(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>Update</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}

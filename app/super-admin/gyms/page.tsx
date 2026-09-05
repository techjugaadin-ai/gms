'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { DateInput } from '@/components/ui/DateInput';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils/date';
import { calculateSubscriptionEndDate, getTodayISODate } from '@/lib/utils/subscription';
import type { Gym } from '@/types/gym';
import { Eye, Ban, CheckCircle, RefreshCw, Plus, Download, Trash2 } from 'lucide-react';

const statusBadge = (status: string) => status === 'active'
  ? { variant: 'green' as const, label: 'Active' }
  : { variant: 'red' as const, label: 'Suspended' };

const paymentBadge = (status: string): 'green' | 'red' | 'yellow' =>
  status === 'paid' ? 'green' : status === 'pending' ? 'yellow' : 'red';

interface GymWithMemberCount extends Gym {
  memberCount?: number;
}

export default function GymsPage() {
  const { toast } = useToast();
  const [gyms, setGyms] = useState<GymWithMemberCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewTarget, setRenewTarget] = useState<Gym | null>(null);
  const [renewForm, setRenewForm] = useState({ subscriptionPlan: 'yearly', subscriptionStartDate: '', subscriptionEndDate: '', paymentStatus: 'paid', subscriptionAmount: 0 });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Gym | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingData, setDeletingData] = useState(false);

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

  const handleExport = async (gym: GymWithMemberCount) => {
    try {
      const res = await fetch(`/api/admin/gyms/${gym.id}/export`, {
        credentials: 'include',
      });

      if (!res.ok) {
        toast('error', 'Failed to export gym data');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Gym_${gym.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast('success', 'Gym data exported successfully');
    } catch (error) {
      toast('error', 'Failed to export gym data');
    }
  };

  const openRenew = (gym: Gym) => {
    const today = getTodayISODate();
    setRenewTarget(gym);
    setRenewForm({
      subscriptionPlan: gym.subscriptionPlan,
      subscriptionStartDate: today,
      subscriptionEndDate: calculateSubscriptionEndDate(today, getPlanDuration(gym.subscriptionPlan)),
      paymentStatus: 'paid',
      subscriptionAmount: gym.subscriptionAmount,
    });
  };

  const getPlanDuration = (plan: string) => ({ monthly: 1, quarterly: 3, 'half-yearly': 6, yearly: 12, custom: 1 }[plan] ?? 1);

  const handleRenewPlanChange = (subscriptionPlan: string) => {
    setRenewForm((form) => ({
      ...form,
      subscriptionPlan,
      subscriptionEndDate: calculateSubscriptionEndDate(form.subscriptionStartDate, getPlanDuration(subscriptionPlan)),
    }));
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

  const handleDeleteGymData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteTarget) return;

    if (deletePassword !== 'delete_data') {
      toast('error', 'Incorrect password');
      return;
    }

    setDeletingData(true);
    const res = await fetch(`/api/admin/gyms/${deleteTarget.id}/delete-all-data`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password: deletePassword }),
    });
    const data = await res.json();
    if (data.success) {
      toast('success', 'Gym and all associated data deleted successfully');
      setDeleteTarget(null);
      setDeletePassword('');
      fetchGyms();
    } else {
      toast('error', data.error?.message ?? 'Failed to delete gym data');
    }
    setDeletingData(false);
  };

  return (
    <AppLayout role="SUPER_ADMIN" title="All Gyms">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">All Gyms</h1>
        <Link href="/super-admin/onboard-gym">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="h-4 w-4" />
            Onboard New Gym
          </button>
        </Link>
      </div>

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
                      <td className="px-4 py-3 text-sm text-gray-600 font-semibold">{g.memberCount ?? 0}</td>
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
                            className="p-1.5 rounded hover:bg-green-50 transition-colors"
                            title="Export to Excel"
                            onClick={() => handleExport(g)}
                          >
                            <Download className="h-4 w-4 text-green-600" />
                          </button>
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
                          <button
                            className="p-1.5 rounded hover:bg-red-50 transition-colors"
                            title="Delete all gym data"
                            onClick={() => setDeleteTarget(g)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
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
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium"
              value={renewForm.subscriptionPlan}
              onChange={(e) => handleRenewPlanChange(e.target.value)}
            >
              {['monthly', 'quarterly', 'half-yearly', 'yearly', 'custom'].map((p) => (
                <option key={p} value={p} className="capitalize">{p}</option>
              ))}
            </select>
          </div>
          <DateInput
            label="Start Date"
            id="subStart"
            value={renewForm.subscriptionStartDate}
            onChange={(value) => setRenewForm((f) => ({
              ...f,
              subscriptionStartDate: value,
              subscriptionEndDate: calculateSubscriptionEndDate(value, getPlanDuration(f.subscriptionPlan)),
            }))}
            required
          />
          <DateInput
            label="End Date"
            id="subEnd"
            value={renewForm.subscriptionEndDate}
            onChange={(value) => setRenewForm((f) => ({ ...f, subscriptionEndDate: value }))}
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
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium"
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

      {/* Delete gym data modal */}
      <Modal open={!!deleteTarget} onClose={() => { setDeleteTarget(null); setDeletePassword(''); }} title="Delete Gym Data">
        <form onSubmit={handleDeleteGymData} className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-red-800">
              ⚠️ Warning: This will permanently delete all data for <strong>{deleteTarget?.name}</strong> including:
            </p>
            <ul className="text-xs text-red-700 mt-2 ml-4 list-disc">
              <li>All members</li>
              <li>All payments</li>
              <li>All membership plans</li>
              <li>The gym account itself</li>
            </ul>
          </div>
          <div>
            <label htmlFor="deletePassword" className="block text-sm font-medium text-gray-700 mb-1">
              Enter Password to Confirm
            </label>
            <input
              id="deletePassword"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter password to confirm deletion"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:border-red-500 focus:outline-none"
              required
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => { setDeleteTarget(null); setDeletePassword(''); }}>Cancel</Button>
            <Button type="submit" loading={deletingData} className="bg-red-600 hover:bg-red-700 text-white">Delete All Data</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}

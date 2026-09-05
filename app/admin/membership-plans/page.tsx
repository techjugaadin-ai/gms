'use client';
import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import type { MembershipPlan } from '@/types/membership-plan';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';

export default function MembershipPlansPage() {
  const { toast } = useToast();
  const { user, gym } = useUserInfo();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<MembershipPlan | null>(null);
  const [editTarget, setEditTarget] = useState<MembershipPlan | null>(null);
  const [form, setForm] = useState({ name: '', durationMonths: 1, price: 0, active: true });
  const [saving, setSaving] = useState(false);

  const fetchPlans = useCallback(async () => {
    const res = await fetch('/api/membership-plans', { credentials: 'include' });
    const data = await res.json();
    if (data.success) setPlans(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ name: '', durationMonths: 1, price: 0, active: true });
    setModal(true);
  };

  const openEdit = (plan: MembershipPlan) => {
    setEditTarget(plan);
    setForm({ name: plan.name, durationMonths: plan.durationMonths, price: plan.price, active: plan.active });
    setModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = editTarget ? `/api/membership-plans/${editTarget.id}` : '/api/membership-plans';
    const method = editTarget ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      toast('success', editTarget ? 'Plan updated' : 'Plan created');
      setModal(false);
      fetchPlans();
    } else {
      toast('error', data.error?.message ?? 'Failed');
    }
    setSaving(false);
  };

  const handleDeactivate = async (plan: MembershipPlan) => {
    const res = await fetch(`/api/membership-plans/${plan.id}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json();
    if (data.success) { toast('success', 'Plan deactivated'); fetchPlans(); }
    else toast('error', 'Failed to deactivate');
  };

  const handleToggleStatus = async (plan: MembershipPlan) => {
    setSaving(true);
    const res = await fetch(`/api/membership-plans/${plan.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ active: !plan.active }),
    });
    const data = await res.json();
    if (data.success) {
      toast('success', `Plan ${!plan.active ? 'activated' : 'deactivated'}`);
      fetchPlans();
    } else {
      toast('error', data.error?.message ?? 'Failed to update status');
    }
    setSaving(false);
  };

  const handlePermanentDelete = async (plan: MembershipPlan) => {
    setSaving(true);
    const res = await fetch(`/api/membership-plans/${plan.id}/permanent`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json();
    if (data.success) {
      toast('success', 'Plan deleted permanently');
      setDeleteConfirmTarget(null);
      fetchPlans();
    } else {
      toast('error', data.error?.message ?? 'Failed to delete plan');
    }
    setSaving(false);
  };

  return (
    <AppLayout role="GYM_OWNER" gymName={gym?.name} userName={user?.name} title="Membership Plans">
      <div className="space-y-4 max-w-2xl">
        <div className="flex justify-end">
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Plan
          </Button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                  {['Plan', 'Duration', 'Price', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400 dark:text-slate-500">Loading...</td></tr>
              ) : plans.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400 dark:text-slate-500">No plans yet</td></tr>
              ) : (
                plans.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-slate-100">{p.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300">{p.durationMonths} month{p.durationMonths !== 1 ? 's' : ''}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-slate-100">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.active ? 'green' : 'gray'}>{p.active ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 dark:text-blue-400 transition-colors"
                          onClick={() => openEdit(p)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                            p.active
                              ? 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-500 dark:text-yellow-400'
                              : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500 dark:text-green-400'
                          }`}
                          onClick={() => handleToggleStatus(p)}
                          title={p.active ? 'Deactivate' : 'Activate'}
                        >
                          {p.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>

                        <button
                          className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors"
                          onClick={() => setDeleteConfirmTarget(p)}
                          title="Delete permanently"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editTarget ? 'Edit Plan' : 'New Membership Plan'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Plan Name" id="planName" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <Input
            label="Duration (months)"
            id="duration"
            type="number"
            min={1}
            value={form.durationMonths}
            onChange={(e) => setForm((f) => ({ ...f, durationMonths: parseInt(e.target.value) }))}
            required
          />
          <Input
            label="Price (₹)"
            id="price"
            type="number"
            min={1}
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) }))}
            required
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editTarget ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteConfirmTarget} onClose={() => setDeleteConfirmTarget(null)} title="Delete Plan Permanently">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Are you sure you want to permanently delete the plan <strong>{deleteConfirmTarget?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setDeleteConfirmTarget(null)}>Cancel</Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700"
              loading={saving}
              onClick={() => deleteConfirmTarget && handlePermanentDelete(deleteConfirmTarget)}
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

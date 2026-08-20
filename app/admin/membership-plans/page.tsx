'use client';
import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import type { MembershipPlan } from '@/types/membership-plan';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function MembershipPlansPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
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

  return (
    <AppLayout role="GYM_OWNER" title="Membership Plans">
      <div className="space-y-4 max-w-2xl">
        <div className="flex justify-end">
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Plan
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Plan', 'Duration', 'Price', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">Loading...</td></tr>
              ) : plans.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">No plans yet</td></tr>
              ) : (
                plans.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.durationMonths} month{p.durationMonths !== 1 ? 's' : ''}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.active ? 'green' : 'gray'}>{p.active ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded hover:bg-gray-100 transition-colors" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4 text-gray-500" />
                        </button>
                        {p.active && (
                          <button className="p-1.5 rounded hover:bg-red-50 transition-colors" onClick={() => handleDeactivate(p)}>
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
    </AppLayout>
  );
}

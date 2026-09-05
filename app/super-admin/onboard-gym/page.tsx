'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DateInput } from '@/components/ui/DateInput';
import { useToast } from '@/components/ui/Toast';
import { calculateSubscriptionEndDate, getTodayISODate } from '@/lib/utils/subscription';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const planDurations: Record<string, number> = {
  monthly: 1,
  quarterly: 3,
  'half-yearly': 6,
  yearly: 12,
  custom: 0,
};

export default function OnboardGymPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    gymName: '',
    ownerName: '',
    ownerEmail: '',
    password: '',
    phone: '',
    address: '',
    currency: 'INR',
    subscriptionPlan: 'yearly',
    subscriptionStartDate: getTodayISODate(),
    subscriptionEndDate: calculateSubscriptionEndDate(getTodayISODate(), 12),
    subscriptionAmount: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numValue = ['subscriptionAmount'].includes(name) ? Number(value) : value;
    setForm(prev => ({
      ...prev,
      [name]: numValue,
    }));
  };

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const plan = e.target.value;
    const duration = planDurations[plan] || 0;
    const endDate = duration > 0 ? calculateSubscriptionEndDate(form.subscriptionStartDate, duration) : form.subscriptionEndDate;
    
    setForm(prev => ({
      ...prev,
      subscriptionPlan: plan,
      subscriptionEndDate: endDate,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/gyms/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = await res.json();
      
      if (data.success) {
        toast('success', 'Gym onboarded successfully!');
        // Copy credentials to clipboard
        const credentials = `Email: ${form.ownerEmail}\nPassword: ${form.password}`;
        navigator.clipboard.writeText(credentials);
        toast('success', 'Credentials copied to clipboard');
        setTimeout(() => router.push('/super-admin/gyms'), 2000);
      } else {
        toast('error', data.error?.message || 'Failed to onboard gym');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      toast('error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout role="SUPER_ADMIN" title="Onboard New Gym">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/super-admin/gyms" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4" />
            Back to Gyms
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Onboard New Gym</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Gym Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Gym Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gym Name</label>
                  <Input
                    type="text"
                    name="gymName"
                    placeholder="e.g., FitZone Gym"
                    value={form.gymName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="e.g., 9876543210"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <Input
                    type="text"
                    name="address"
                    placeholder="e.g., 123 Fitness Lane, City"
                    value={form.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                  >
                    <option value="INR" className="text-gray-900">INR (₹)</option>
                    <option value="USD" className="text-gray-900">USD ($)</option>
                    <option value="EUR" className="text-gray-900">EUR (€)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Gym Owner Account</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                  <Input
                    type="text"
                    name="ownerName"
                    placeholder="e.g., John Doe"
                    value={form.ownerName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email</label>
                  <Input
                    type="email"
                    name="ownerEmail"
                    placeholder="e.g., owner@gymname.com"
                    value={form.ownerEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Minimum 8 characters"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
                  <select
                    name="subscriptionPlan"
                    value={form.subscriptionPlan}
                    onChange={handlePlanChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                  >
                    <option value="monthly" className="text-gray-900">Monthly</option>
                    <option value="quarterly" className="text-gray-900">Quarterly (3 months)</option>
                    <option value="half-yearly" className="text-gray-900">Half Yearly (6 months)</option>
                    <option value="yearly" className="text-gray-900">Yearly</option>
                    <option value="custom" className="text-gray-900">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Amount</label>
                  <Input
                    type="number"
                    name="subscriptionAmount"
                    placeholder="e.g., 10000"
                    value={form.subscriptionAmount}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <DateInput
                    id="subscriptionStartDate"
                    value={form.subscriptionStartDate}
                    onChange={(value) => {
                      const duration = planDurations[form.subscriptionPlan] || 0;
                      const endDate = duration > 0 ? calculateSubscriptionEndDate(value, duration) : form.subscriptionEndDate;
                      setForm(prev => ({
                        ...prev,
                        subscriptionStartDate: value,
                        subscriptionEndDate: endDate,
                      }));
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <DateInput
                    id="subscriptionEndDate"
                    value={form.subscriptionEndDate}
                    onChange={(value) => setForm(prev => ({
                      ...prev,
                      subscriptionEndDate: value,
                    }))}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Onboarding...' : 'Onboard Gym'}
              </Button>
              <Link href="/super-admin/gyms" className="flex-1">
                <Button
                  type="button"
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> After onboarding, the gym owner can log in with the provided credentials and start adding members, membership plans, and other gym details.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

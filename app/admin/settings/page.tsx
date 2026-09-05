'use client';
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { Gym } from '@/types/gym';

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, gym: userGym } = useUserInfo();
  const [gym, setGym] = useState<Partial<Gym>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  // Personal details state
  const [personalDetails, setPersonalDetails] = useState({ name: '', email: '' });
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });

  useEffect(() => {
    fetch('/api/gym', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { 
        if (d.success) setGym(d.data); 
        setLoading(false); 
      });
    
    // Initialize personal details
    if (user) {
      setPersonalDetails({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  const setGymField = (field: keyof Gym, value: string) => setGym((prev) => ({ ...prev, [field]: value }));

  const handleSaveGym = async (e: React.FormEvent) => {
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
      toast('success', 'Gym settings saved');
      setGym(data.data);
    } else {
      toast('error', data.error?.message ?? 'Failed to save');
    }
    setSaving(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalDetails.name.trim() || !personalDetails.email.trim()) {
      toast('error', 'Name and email are required');
      return;
    }
    setSavingProfile(true);
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(personalDetails),
    });
    const data = await res.json();
    if (data.success) {
      toast('success', 'Profile updated successfully');
    } else {
      toast('error', data.error?.message ?? 'Failed to update profile');
    }
    setSavingProfile(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast('error', 'All password fields are required');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast('error', 'New password must be at least 8 characters');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast('error', 'Passwords do not match');
      return;
    }
    
    setSavingPassword(true);
    const res = await fetch('/api/auth/change-password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(passwordForm),
    });
    const data = await res.json();
    
    if (data.success) {
      toast('success', 'Password changed successfully');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      toast('error', data.error?.message ?? 'Failed to change password');
    }
    setSavingPassword(false);
  };

  if (loading) {
    return (
      <AppLayout role="GYM_OWNER" gymName={userGym?.name} userName={user?.name} title="Settings">
        <p className="text-sm text-gray-400">Loading...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="GYM_OWNER" gymName={userGym?.name} userName={user?.name} title="Settings">
      <div className="max-w-2xl space-y-6">
        {/* Personal Details Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Personal Details</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input 
              label="Name" 
              id="user-name" 
              value={personalDetails.name} 
              onChange={(e) => setPersonalDetails({ ...personalDetails, name: e.target.value })} 
              required 
            />
            <Input 
              label="Email" 
              id="user-email" 
              type="email" 
              value={personalDetails.email} 
              onChange={(e) => setPersonalDetails({ ...personalDetails, email: e.target.value })} 
              required 
            />
            <div className="pt-2">
              <Button type="submit" loading={savingProfile}>Save Profile</Button>
            </div>
          </form>
        </div>

        {/* Gym Configuration Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Gym Configuration</h2>
          <form onSubmit={handleSaveGym} className="space-y-4">
            <Input label="Gym Name" id="name" value={gym.name ?? ''} onChange={(e) => setGymField('name', e.target.value)} required />
            <Input label="Phone" id="phone" value={gym.phone ?? ''} onChange={(e) => setGymField('phone', e.target.value)} />
            <Input label="Email" id="gym-email" type="email" value={gym.email ?? ''} onChange={(e) => setGymField('email', e.target.value)} />
            <Input label="Address" id="address" value={gym.address ?? ''} onChange={(e) => setGymField('address', e.target.value)} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Currency</label>
              <select
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black"
                value={gym.currency ?? 'INR'}
                onChange={(e) => setGymField('currency', e.target.value)}
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

        {/* Change Password Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="old-password" className="text-sm font-medium text-gray-700">Current Password</label>
              <div className="relative">
                <input
                  id="old-password"
                  type={showPasswords.old ? 'text' : 'password'}
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
                >
                  {showPasswords.old ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="new-password" className="text-sm font-medium text-gray-700">New Password</label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
                >
                  {showPasswords.new ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
                >
                  {showPasswords.confirm ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" loading={savingPassword}>Change Password</Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

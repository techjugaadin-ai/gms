'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Dumbbell } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error?.message ?? 'Login failed');
        return;
      }
      const role = data.data.user.role;
      toast('success', `Welcome, ${data.data.user.name}!`);
      if (role === 'SUPER_ADMIN') router.push('/super-admin');
      else router.push('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center mb-3">
              <Dumbbell className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">GMS</h1>
            <p className="text-sm text-gray-500 mt-1">Gym Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">{error}</p>
            )}
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-2">Demo accounts</p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => { setEmail('superadmin@gms.local'); setPassword('Admin@123'); }}
                className="w-full text-left text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
              >
                Super Admin: superadmin@gms.local
              </button>
              <button
                type="button"
                onClick={() => { setEmail('owner@gms.local'); setPassword('Owner@123'); }}
                className="w-full text-left text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
              >
                Gym Owner: owner@gms.local
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

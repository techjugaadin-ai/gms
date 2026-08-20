'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Dumbbell, Shield, Building2 } from 'lucide-react';

interface Gym {
  id: string;
  name: string;
  status: string;
}

export default function RootPage() {
  const router = useRouter();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        // Try to fetch gyms without auth (for display only)
        const res = await fetch('/api/admin/gyms', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setGyms(data.data || []);
          }
        } else {
          // If auth fails, show hardcoded gyms for demo
          setGyms([
            { id: 'gym_001', name: 'FitZone Gym', status: 'active' },
            { id: 'gym_002', name: 'PowerHouse Fitness', status: 'active' },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch gyms:', error);
        // Fallback to hardcoded gyms
        setGyms([
          { id: 'gym_001', name: 'FitZone Gym', status: 'active' },
          { id: 'gym_002', name: 'PowerHouse Fitness', status: 'active' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchGyms();
  }, []);

  const handleSuperAdmin = async () => {
    setIsLoggingIn(true);
    try {
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: 'superadmin@gms.local', password: 'SuperAdmin#2026!' }),
      });
      
      if (!loginRes.ok) {
        alert('Login failed');
        setIsLoggingIn(false);
        return;
      }

      const loginData = await loginRes.json();
      if (!loginData.success) {
        alert('Login failed: ' + loginData.error?.message);
        setIsLoggingIn(false);
        return;
      }

      // Small delay to ensure cookie is set
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify session before redirecting
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (meRes.ok) {
        router.push('/super-admin');
      } else {
        alert('Session verification failed');
        setIsLoggingIn(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login error: ' + String(error));
      setIsLoggingIn(false);
    }
  };

  const handleGymClick = async (gymId: string) => {
    setIsLoggingIn(true);
    try {
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: 'owner@gms.local', password: 'GymOwner#2026!' }),
      });

      if (!loginRes.ok) {
        alert('Login failed');
        setIsLoggingIn(false);
        return;
      }

      const loginData = await loginRes.json();
      if (!loginData.success) {
        alert('Login failed: ' + loginData.error?.message);
        setIsLoggingIn(false);
        return;
      }

      // Small delay to ensure cookie is set
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify session before redirecting
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (meRes.ok) {
        router.push('/dashboard');
      } else {
        alert('Session verification failed');
        setIsLoggingIn(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login error: ' + String(error));
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Dumbbell className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gym Management System</h1>
          <p className="text-lg text-gray-600">Select your role to continue</p>
        </div>

        {/* Super Admin Card */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin</h2>
          <div
            onClick={handleSuperAdmin}
            className={`bg-white rounded-xl shadow-lg p-8 cursor-pointer transition-all ${
              isLoggingIn
                ? 'opacity-50 pointer-events-none'
                : 'hover:shadow-2xl hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">Super Admin</h3>
                <p className="text-gray-600">Manage all gyms and SaaS metrics</p>
              </div>
              <Button variant="primary" disabled={isLoggingIn}>
                {isLoggingIn ? 'Logging in...' : 'Access'}
              </Button>
            </div>
          </div>
        </div>

        {/* Gyms Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Gym Owners</h2>
          {loading ? (
            <div className="text-center text-gray-600 py-8">Loading gyms...</div>
          ) : gyms.length === 0 ? (
            <div className="text-center text-gray-600 py-8">No gyms available</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gyms.map((gym) => (
                <div
                  key={gym.id}
                  onClick={() => handleGymClick(gym.id)}
                  className={`bg-white rounded-xl shadow-lg p-8 cursor-pointer transition-all ${
                    isLoggingIn
                      ? 'opacity-50 pointer-events-none'
                      : 'hover:shadow-2xl hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{gym.name}</h3>
                      <div className="flex gap-2 mt-2">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            gym.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {gym.status === 'active' ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                    </div>
                    <Button variant="primary" disabled={isLoggingIn}>
                      {isLoggingIn ? 'Logging in...' : 'Access'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-gray-600 text-sm">
          <p>Click any option above to access the system.</p>
        </div>
      </div>
    </div>
  );
}

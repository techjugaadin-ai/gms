import { useEffect, useState, useRef } from 'react';
import type { SessionUser } from '@/types/user';
import type { Gym } from '@/types/gym';

interface UseUserInfoResult {
  user: SessionUser | null;
  gym: Gym | null;
  loading: boolean;
}

export function useUserInfo(): UseUserInfoResult {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);
  const lastEmailRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          setUser(data.data.user);
          setGym(data.data.gym);
          lastEmailRef.current = data.data.user?.email ?? null;
        } else {
          setUser(null);
          setGym(null);
          lastEmailRef.current = null;
        }
      } catch {
        setUser(null);
        setGym(null);
        lastEmailRef.current = null;
      } finally {
        setLoading(false);
      }
    };

    // Fetch initial user info
    fetchUserInfo();

    // Set up interval to check for session changes
    const interval = setInterval(fetchUserInfo, 2000);

    return () => clearInterval(interval);
  }, []);

  return { user, gym, loading };
}

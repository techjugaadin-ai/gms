'use client';
import { useEffect, useState } from 'react';

interface SessionData {
  id: string;
  email: string;
  name: string;
  role: string;
  gymId: string | null;
}

export function SessionInfo() {
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    fetch('/api/debug/session', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSession(data.data);
      })
      .catch(() => {});
  }, []);

  if (!session) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-900 max-w-xs">
      <div className="font-semibold mb-1">Session Info</div>
      <div>Email: {session.email}</div>
      <div>Gym ID: <span className="font-mono font-bold">{session.gymId || 'N/A'}</span></div>
      <div>Role: {session.role}</div>
    </div>
  );
}

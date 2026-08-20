'use client';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TopNavProps {
  title: string;
}

export function TopNav({ title }: TopNavProps) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch('/api/notifications', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setUnread(data.data.filter((n: { read: boolean }) => !n.read).length);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <Link href="/notifications" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
        <Bell className="h-5 w-5 text-gray-600" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Link>
    </header>
  );
}

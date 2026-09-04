'use client';
import { Bell, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useUserInfo } from '@/lib/hooks/useUserInfo';

interface TopNavProps {
  title: string;
  onMenuToggle: () => void;
}

export function TopNav({ title, onMenuToggle }: TopNavProps) {
  const { user } = useUserInfo();
  const [unread, setUnread] = useState(0);

  const notificationHref = user?.role === 'SUPER_ADMIN' ? '/super-admin/notifications' : '/notifications';

  useEffect(() => {
    const endpoint = user?.role === 'SUPER_ADMIN' ? '/api/admin/notifications' : '/api/notifications';
    fetch(endpoint, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          if (user?.role === 'SUPER_ADMIN') {
            // For super admin, count all notifications
            setUnread(data.data.length);
          } else {
            // For gym owner, count unread
            setUnread(data.data.filter((n: { read: boolean }) => !n.read).length);
          }
        }
      })
      .catch(() => {});
  }, [user?.role]);

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700/60 flex items-center justify-between px-3 sm:px-5 flex-shrink-0 sticky top-0 z-50">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — only visible on mobile, lives inside the header for alignment */}
        <button
          onClick={onMenuToggle}
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-gray-800 dark:text-slate-100 truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <ThemeToggle />
        <Link
          href={notificationHref}
          className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold leading-none">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

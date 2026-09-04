'use client';
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { formatDate } from '@/lib/utils/date';
import type { Notification } from '@/types/notification';
import { Bell, CheckCircle, BellOff } from 'lucide-react';

const typeColors: Record<string, 'green' | 'yellow' | 'red' | 'orange'> = {
  MEMBERSHIP_EXPIRING_7_DAYS: 'yellow',
  MEMBERSHIP_EXPIRING_3_DAYS: 'orange',
  MEMBERSHIP_EXPIRING_1_DAY: 'orange',
  MEMBERSHIP_EXPIRED_TODAY: 'red',
  MEMBERSHIP_EXPIRED_2_DAYS: 'red',
  MEMBERSHIP_EXPIRED_7_DAYS: 'red',
  PAYMENT_PENDING: 'yellow',
};

export default function NotificationsPage() {
  const { toast } = useToast();
  const { user, gym } = useUserInfo();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const res = await fetch('/api/notifications', { credentials: 'include' });
    const data = await res.json();
    if (data.success) {
      setNotifications(data.data.sort((a: Notification, b: Notification) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const markRead = async (id: string) => {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH', credentials: 'include' });
    const data = await res.json();
    if (data.success) {
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } else {
      toast('error', 'Failed to mark as read');
    }
  };

  const markUnread = async (id: string) => {
    const res = await fetch(`/api/notifications/${id}/unread`, { method: 'PATCH', credentials: 'include' });
    const data = await res.json();
    if (data.success) {
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: false } : n));
    } else {
      toast('error', 'Failed to mark as unread');
    }
  };

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <AppLayout role="GYM_OWNER" gymName={gym?.name} userName={user?.name} title="Notifications">
      <div className="space-y-6 max-w-3xl">
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-30 animate-pulse" />
            <p className="text-sm">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Bell className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <>
            {unread.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                  Unread ({unread.length})
                </h2>
                <div className="space-y-2">
                  {unread.map((n) => (
                    <div
                      key={n.id}
                      className="bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800/50 border-l-2 border-l-blue-500 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <Bell className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 dark:text-slate-200">{n.message}</p>
                          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{formatDate(n.createdAt)}</p>
                        </div>
                        <button
                          onClick={() => markRead(n.id)}
                          className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors flex-shrink-0"
                          title="Mark as read"
                          aria-label="Mark as read"
                        >
                          <CheckCircle className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {read.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                  Read ({read.length})
                </h2>
                <div className="space-y-2">
                  {read.map((n) => (
                    <div
                      key={n.id}
                      className="bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <Bell className="h-4 w-4 text-gray-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-500 dark:text-slate-400">{n.message}</p>
                          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{formatDate(n.createdAt)}</p>
                        </div>
                        <button
                          onClick={() => markUnread(n.id)}
                          className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex-shrink-0"
                          title="Mark as unread"
                          aria-label="Mark as unread"
                        >
                          <BellOff className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

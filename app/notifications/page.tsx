'use client';
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils/date';
import type { Notification } from '@/types/notification';
import { Bell, CheckCircle } from 'lucide-react';

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

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <AppLayout role="GYM_OWNER" title="Notifications">
      <div className="space-y-6 max-w-2xl">
        {unread.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Unread ({unread.length})
            </h2>
            <div className="space-y-2">
              {unread.map((n) => (
                <div key={n.id} className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm flex items-start gap-3">
                  <Bell className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => markRead(n.id)}
                    className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {read.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Read</h2>
            <div className="space-y-2">
              {read.map((n) => (
                <div key={n.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-start gap-3">
                  <Bell className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No notifications</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { formatDate } from '@/lib/utils/date';
import { Bell, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SubscriptionNotification {
  id: string;
  type: 'SUBSCRIPTION_EXPIRING_SOON' | 'SUBSCRIPTION_EXPIRED';
  gymId: string;
  gymName: string;
  message: string;
  daysUntilExpiry: number;
  subscriptionEndDate: string;
  severity: 'warning' | 'error';
}

export default function SuperAdminNotificationsPage() {
  const { toast } = useToast();
  const { user } = useUserInfo();
  const router = useRouter();
  const [notifications, setNotifications] = useState<SubscriptionNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'expired' | 'expiring'>('all');

  // Check auth
  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (!user || user.role !== 'SUPER_ADMIN') return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/admin/notifications', { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        toast('error', 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, toast]);

  // Show loading while checking auth
  if (!user || user.role !== 'SUPER_ADMIN') {
    return (
      <AppLayout role="SUPER_ADMIN" userName="Loading..." title="Subscription Notifications">
        <div className="text-center py-12 text-gray-400">
          <Bell className="h-8 w-8 mx-auto mb-2 opacity-30 animate-pulse" />
          <p className="text-sm">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'expired') return n.type === 'SUBSCRIPTION_EXPIRED';
    if (filter === 'expiring') return n.type === 'SUBSCRIPTION_EXPIRING_SOON';
    return true;
  });

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    if (a.severity !== b.severity) {
      return a.severity === 'error' ? -1 : 1;
    }
    return a.daysUntilExpiry - b.daysUntilExpiry;
  });

  return (
    <AppLayout role="SUPER_ADMIN" userName={user?.name} title="Subscription Notifications">
      <div className="space-y-6 max-w-5xl">
        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700">
          {(['all', 'expiring', 'expired'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                filter === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
              }`}
            >
              {tab === 'all' && `All (${notifications.length})`}
              {tab === 'expiring' && `Expiring Soon (${notifications.filter((n) => n.type === 'SUBSCRIPTION_EXPIRING_SOON').length})`}
              {tab === 'expired' && `Expired (${notifications.filter((n) => n.type === 'SUBSCRIPTION_EXPIRED').length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-30 animate-pulse" />
            <p className="text-sm">Loading notifications...</p>
          </div>
        ) : sortedNotifications.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-30 text-green-500" />
            <p className="text-sm">
              {filter === 'all' && 'No subscription notifications'}
              {filter === 'expiring' && 'No subscriptions expiring soon'}
              {filter === 'expired' && 'No expired subscriptions'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedNotifications.map((notif) => (
              <article
                key={notif.id}
                className={`rounded-md border p-4 shadow-sm ${
                  notif.severity === 'error'
                    ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20'
                    : 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-900/50 dark:bg-yellow-950/10'
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href="/super-admin/gyms"
                        className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {notif.gymName}
                      </Link>
                      <Badge variant={notif.severity === 'error' ? 'red' : 'yellow'}>
                        {notif.type === 'SUBSCRIPTION_EXPIRED' ? 'Expired' : 'Expiring Soon'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-slate-300">{notif.message}</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">
                      Subscription ended on {formatDate(notif.subscriptionEndDate)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                        notif.daysUntilExpiry < 0
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}
                    >
                      {notif.daysUntilExpiry < 0 ? `${Math.abs(notif.daysUntilExpiry)}d ago` : `${notif.daysUntilExpiry}d left`}
                    </span>
                    <Link
                      href="/super-admin/gyms"
                      className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Renew
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

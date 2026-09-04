'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, XCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/date';

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

export function SubscriptionNotifications() {
  const [notifications, setNotifications] = useState<SubscriptionNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/admin/notifications', { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const visibleNotifications = notifications.filter(n => !dismissed.has(n.id));

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-20 bg-slate-700 rounded-md"></div>
      </div>
    );
  }

  if (visibleNotifications.length === 0) {
    return null;
  }

  const errorNotifications = visibleNotifications.filter(n => n.severity === 'error');
  const warningNotifications = visibleNotifications.filter(n => n.severity === 'warning');

  return (
    <div className="space-y-2">
      {errorNotifications.map(notif => (
        <div
          key={notif.id}
          className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-md"
        >
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">{notif.message}</p>
            <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">Subscription ended on {formatDate(notif.subscriptionEndDate)}</p>
          </div>
          <button
            onClick={() => setDismissed(new Set([...dismissed, notif.id]))}
            className="text-red-500 hover:text-red-600 flex-shrink-0"
          >
            ×
          </button>
        </div>
      ))}

      {warningNotifications.map(notif => (
        <div
          key={notif.id}
          className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md"
        >
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">{notif.message}</p>
            <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-0.5">Expires on {formatDate(notif.subscriptionEndDate)}</p>
          </div>
          <button
            onClick={() => setDismissed(new Set([...dismissed, notif.id]))}
            className="text-yellow-600 hover:text-yellow-700 flex-shrink-0"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

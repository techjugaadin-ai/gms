'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { formatDate } from '@/lib/utils/date';
import type { Notification } from '@/types/notification';
import { Bell } from 'lucide-react';
import { FaPhone, FaWhatsapp } from 'react-icons/fa';

// Utility function to clean phone number for wa.me URL
const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/[\s\-\(\)\+]/g, '');
};

// Utility function to generate WhatsApp message with formatting
const generateWhatsAppMessage = (
  memberName: string,
  daysUntilExpiry: number | undefined,
  upiNumber: string,
  gymName: string | undefined
): string => {
  let statusText = '';
  
  if (daysUntilExpiry === undefined || daysUntilExpiry === 0) {
    statusText = 'Your membership expires today';
  } else if (daysUntilExpiry < 0) {
    statusText = `Your membership expired ${Math.abs(daysUntilExpiry)} days ago`;
  } else {
    statusText = `Your membership will expire in ${daysUntilExpiry} days`;
  }
  
  return `Hey ${memberName},\n\n${statusText}.\n\nPlease pay and send the payment screenshot to:\n${upiNumber}\n\nRegards,\n${gymName || 'Gym'}`;
};

export default function NotificationsPage() {
  const { user, gym } = useUserInfo();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications', { credentials: 'include' })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setNotifications([...data.data].sort((a: Notification, b: Notification) =>
            (a.daysUntilExpiry ?? 0) - (b.daysUntilExpiry ?? 0),
          ));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout role="GYM_OWNER" gymName={gym?.name} userName={user?.name} title="Notifications">
      <div className="max-w-3xl space-y-6">
        {loading ? (
          <div className="py-12 text-center text-gray-400">
            <Bell className="mx-auto mb-2 h-8 w-8 animate-pulse opacity-30" />
            <p className="text-sm">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Bell className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p className="text-sm">No current notifications</p>
          </div>
        ) : (
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">
              Current Alerts ({notifications.length})
            </h2>
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div key={notification.id} className="rounded-xl border border-blue-200 border-l-2 border-l-blue-500 bg-white p-4 dark:border-blue-800/50 dark:bg-slate-800">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Bell className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-800 dark:text-slate-200">{notification.message}</p>
                        <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">{formatDate(notification.createdAt)}</p>
                      </div>
                    </div>
                    {notification.memberPhone && notification.memberName && (
                      <div className="flex gap-3 shrink-0">
                        {/* Call Button */}
                        <a
                          href={`tel:${notification.memberPhone}`}
                          aria-label={`Call ${notification.memberName}`}
                          title={`Call ${notification.memberName}`}
                          className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-white border border-gray-200 hover:border-green-300 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600 dark:hover:border-green-600 text-green-600 dark:text-green-400 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <FaPhone className="h-5 w-5" style={{ transform: 'scaleX(-1)' }} />
                        </a>
                        {/* WhatsApp Button */}
                        <a
                          href={`https://wa.me/${cleanPhoneNumber(notification.memberPhone)}?text=${encodeURIComponent(generateWhatsAppMessage(notification.memberName, notification.daysUntilExpiry, gym?.phone || 'N/A', gym?.name))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`WhatsApp ${notification.memberName}`}
                          title={`WhatsApp ${notification.memberName}`}
                          className="inline-flex items-center justify-center h-12 w-12 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                          style={{
                            backgroundColor: '#25D366',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = '#20BA5A';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = '#25D366';
                          }}
                        >
                          <FaWhatsapp className="h-6 w-6 text-white" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

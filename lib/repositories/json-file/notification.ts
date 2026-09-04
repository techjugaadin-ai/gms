import type { NotificationRepository } from '../interfaces';
import type { Notification } from '@/types/notification';
import { readJsonFile, writeJsonFile } from './base';

const FILE = 'notifications.json';

export const jsonNotificationRepository: NotificationRepository = {
  async findByGymId(gymId) {
    const notifications = readJsonFile<Notification>(FILE);
    return notifications.filter((n) => n.gymId === gymId);
  },

  async findUnreadByGymId(gymId) {
    const notifications = readJsonFile<Notification>(FILE);
    return notifications.filter((n) => n.gymId === gymId && !n.read);
  },

  async create(notification) {
    const notifications = readJsonFile<Notification>(FILE);
    notifications.push(notification);
    writeJsonFile(FILE, notifications);
    return notification;
  },

  async markAsRead(id, gymId) {
    const notifications = readJsonFile<Notification>(FILE);
    const idx = notifications.findIndex((n) => n.id === id && n.gymId === gymId);
    if (idx === -1) return false;
    notifications[idx] = { ...notifications[idx], read: true };
    writeJsonFile(FILE, notifications);
    return true;
  },

  async markAsUnread(id, gymId) {
    const notifications = readJsonFile<Notification>(FILE);
    const idx = notifications.findIndex((n) => n.id === id && n.gymId === gymId);
    if (idx === -1) return false;
    notifications[idx] = { ...notifications[idx], read: false };
    writeJsonFile(FILE, notifications);
    return true;
  },

  async upsertForMember(notification) {
    const notifications = readJsonFile<Notification>(FILE);
    const idx = notifications.findIndex(
      (n) => n.memberId === notification.memberId && n.type === notification.type && n.gymId === notification.gymId
    );
    if (idx === -1) {
      notifications.push(notification);
    } else {
      // Preserve read status and original createdAt when updating an existing notification
      const existing = notifications[idx];
      notifications[idx] = {
        ...existing,
        // update mutable fields only
        message: notification.message ?? existing.message,
        scheduledAt: notification.scheduledAt ?? existing.scheduledAt,
        // keep original createdAt and read flag
        createdAt: existing.createdAt ?? notification.createdAt,
        read: existing.read ?? notification.read,
      };
    }
    writeJsonFile(FILE, notifications);
    return notifications[idx === -1 ? notifications.length - 1 : idx];
  },

  async removeTypesForMember(gymId, memberId, types) {
    const notifications = readJsonFile<Notification>(FILE);
    const filtered = notifications.filter(
      (n) => !(n.gymId === gymId && n.memberId === memberId && types.includes(n.type))
    );
    // If nothing changed, keep original file untouched; otherwise write filtered list
    if (filtered.length !== notifications.length) {
      writeJsonFile(FILE, filtered);
    }
    return;
  },
};

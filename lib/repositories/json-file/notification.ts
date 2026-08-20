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

  async upsertForMember(notification) {
    const notifications = readJsonFile<Notification>(FILE);
    const idx = notifications.findIndex(
      (n) => n.memberId === notification.memberId && n.type === notification.type && n.gymId === notification.gymId
    );
    if (idx === -1) {
      notifications.push(notification);
    } else {
      notifications[idx] = { ...notifications[idx], ...notification };
    }
    writeJsonFile(FILE, notifications);
    return notifications[idx === -1 ? notifications.length - 1 : idx];
  },
};

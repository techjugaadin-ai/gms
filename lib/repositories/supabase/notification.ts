import type { NotificationRepository } from '../interfaces';
import type { Notification } from '@/types/notification';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { toCamelCaseObject, toSnakeCaseObject } from '@/lib/repositories/supabase/transform';

export const supabaseNotificationRepository: NotificationRepository = {
  async findByGymId(gymId) {
    assertSupabaseConfigured();
    const { data, error } = await supabase.from('notifications').select('*').eq('gym_id', gymId).order('scheduled_at', { ascending: false });
    if (error) throw new Error(`Failed to load notifications: ${error.message}`);
    const notifications = (data ?? []).map((row) => toCamelCaseObject(row)) as Notification[];
    return notifications.filter((notification, index, all) =>
      all.findIndex((item) => `${item.memberId}:${item.type}` === `${notification.memberId}:${notification.type}`) === index,
    );
  },

  async findUnreadByGymId(gymId) {
    assertSupabaseConfigured();
    const { data, error } = await supabase.from('notifications').select('*').eq('gym_id', gymId).eq('read', false).order('scheduled_at', { ascending: false });
    if (error) throw new Error(`Failed to load unread notifications: ${error.message}`);
    const notifications = (data ?? []).map((row) => toCamelCaseObject(row)) as Notification[];
    return notifications.filter((notification, index, all) =>
      all.findIndex((item) => `${item.memberId}:${item.type}` === `${notification.memberId}:${notification.type}`) === index,
    );
  },

  async create(notification) {
    assertSupabaseConfigured();
    const payload = toSnakeCaseObject(notification);
    const { data, error } = await supabase.from('notifications').insert(payload).select().single();
    if (error) throw new Error(`Failed to create notification: ${error.message}`);
    return toCamelCaseObject(data) as Notification;
  },

  async markAsRead(id, gymId) {
    assertSupabaseConfigured();
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id).eq('gym_id', gymId);
    if (error) throw new Error(`Failed to mark notification as read: ${error.message}`);
    return true;
  },

  async markAsUnread(id, gymId) {
    assertSupabaseConfigured();
    const { error } = await supabase.from('notifications').update({ read: false }).eq('id', id).eq('gym_id', gymId);
    if (error) throw new Error(`Failed to mark notification as unread: ${error.message}`);
    return true;
  },

  async upsertForMember(notification) {
    assertSupabaseConfigured();
    const payload = toSnakeCaseObject(notification);
    const { data: existing, error: findError } = await supabase
      .from('notifications')
      .select('id, read')
      .eq('gym_id', notification.gymId)
      .eq('member_id', notification.memberId)
      .eq('type', notification.type)
      .order('created_at', { ascending: true });
    if (findError) throw new Error(`Failed to find duplicate notifications: ${findError.message}`);

    const [canonical, ...duplicates] = existing ?? [];
    if (duplicates.length > 0) {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .in('id', duplicates.map((row) => row.id));
      if (deleteError) throw new Error(`Failed to remove duplicate notifications: ${deleteError.message}`);
    }

    const record = canonical ? { ...payload, id: canonical.id, read: canonical.read } : payload;
    const { data, error } = await supabase.from('notifications').upsert(record, { onConflict: 'id' }).select().single();
    if (error) throw new Error(`Failed to upsert notification: ${error.message}`);
    return toCamelCaseObject(data) as Notification;
  },

  async removeTypesForMember(gymId, memberId, types) {
    assertSupabaseConfigured();
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('gym_id', gymId)
      .eq('member_id', memberId)
      .in('type', types);
    if (error) throw new Error(`Failed to remove member notification types: ${error.message}`);
  },
};

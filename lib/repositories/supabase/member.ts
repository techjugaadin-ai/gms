import type { MemberRepository } from '../interfaces';
import type { Member } from '@/types/member';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { toCamelCaseObject, toSnakeCaseObject } from '@/lib/repositories/supabase/transform';

export const supabaseMemberRepository: MemberRepository = {
  async findById(id, gymId) {
    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .eq('gym_id', gymId)
      .eq('is_deleted', false)
      .maybeSingle();
    if (error) throw new Error(`Failed to load member: ${error.message}`);
    return (data ? toCamelCaseObject(data) : null) as Member | null;
  },

  async findByGymId(gymId) {
    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('gym_id', gymId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to load members: ${error.message}`);
    return (data ?? []).map((row) => toCamelCaseObject(row)) as Member[];
  },

  async create(member) {
    assertSupabaseConfigured();
    const payload = toSnakeCaseObject(member);
    const { data, error } = await supabase.from('members').insert(payload).select().single();
    if (error) throw new Error(`Failed to create member: ${error.message}`);
    return toCamelCaseObject(data) as Member;
  },

  async update(id, gymId, data) {
    assertSupabaseConfigured();
    const payload = toSnakeCaseObject({ ...data, updatedAt: new Date().toISOString() });
    const { data: updated, error } = await supabase
      .from('members')
      .update(payload)
      .eq('id', id)
      .eq('gym_id', gymId)
      .eq('is_deleted', false)
      .select()
      .single();
    if (error) throw new Error(`Failed to update member: ${error.message}`);
    return (updated ? toCamelCaseObject(updated) : null) as Member | null;
  },

  async softDelete(id, gymId) {
    assertSupabaseConfigured();
    const { error } = await supabase
      .from('members')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('gym_id', gymId)
      .eq('is_deleted', false);
    if (error) throw new Error(`Failed to delete member: ${error.message}`);
    return true;
  },
};

import type { MembershipPlanRepository } from '../interfaces';
import type { MembershipPlan } from '@/types/membership-plan';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { toCamelCaseObject, toSnakeCaseObject } from '@/lib/repositories/supabase/transform';

export const supabaseMembershipPlanRepository: MembershipPlanRepository = {
  async findById(id, gymId) {
    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('id', id)
      .eq('gym_id', gymId)
      .maybeSingle();
    if (error) throw new Error(`Failed to load membership plan: ${error.message}`);
    return (data ? toCamelCaseObject(data) : null) as MembershipPlan | null;
  },

  async findByGymId(gymId) {
    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to load membership plans: ${error.message}`);
    return (data ?? []).map((row) => toCamelCaseObject(row)) as MembershipPlan[];
  },

  async create(plan) {
    assertSupabaseConfigured();
    const payload = toSnakeCaseObject(plan);
    const { data, error } = await supabase.from('membership_plans').insert(payload).select().single();
    if (error) throw new Error(`Failed to create membership plan: ${error.message}`);
    return toCamelCaseObject(data) as MembershipPlan;
  },

  async update(id, gymId, data) {
    assertSupabaseConfigured();
    const payload = toSnakeCaseObject({ ...data, updatedAt: new Date().toISOString() });
    const { data: updated, error } = await supabase
      .from('membership_plans')
      .update(payload)
      .eq('id', id)
      .eq('gym_id', gymId)
      .select()
      .single();
    if (error) throw new Error(`Failed to update membership plan: ${error.message}`);
    return (updated ? toCamelCaseObject(updated) : null) as MembershipPlan | null;
  },

  async delete(id, gymId) {
    assertSupabaseConfigured();
    const { error } = await supabase
      .from('membership_plans')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('gym_id', gymId);
    if (error) throw new Error(`Failed to delete membership plan: ${error.message}`);
    return true;
  },

  async hardDelete(id, gymId) {
    assertSupabaseConfigured();
    const { error } = await supabase
      .from('membership_plans')
      .delete()
      .eq('id', id)
      .eq('gym_id', gymId);
    if (error) throw new Error(`Failed to permanently delete membership plan: ${error.message}`);
    return true;
  },
};

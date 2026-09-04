import type { GymRepository } from '../interfaces';
import type { Gym } from '@/types/gym';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { toCamelCaseObject, toSnakeCaseObject } from '@/lib/repositories/supabase/transform';

export const supabaseGymRepository: GymRepository = {
  async findById(id) {
    assertSupabaseConfigured();
    const { data, error } = await supabase.from('gyms').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`Failed to load gym: ${error.message}`);
    return (data ? toCamelCaseObject(data) : null) as Gym | null;
  },

  async findAll() {
    assertSupabaseConfigured();
    const { data, error } = await supabase.from('gyms').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to load gyms: ${error.message}`);
    return (data ?? []).map((row) => toCamelCaseObject(row)) as Gym[];
  },

  async create(gym) {
    assertSupabaseConfigured();
    const payload = toSnakeCaseObject(gym);
    const { data, error } = await supabase.from('gyms').insert(payload).select().single();
    if (error) throw new Error(`Failed to create gym: ${error.message}`);
    return toCamelCaseObject(data) as Gym;
  },

  async update(id, data) {
    assertSupabaseConfigured();
    const payload = toSnakeCaseObject({ ...data, updatedAt: new Date().toISOString() });
    const { data: updated, error } = await supabase
      .from('gyms')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Failed to update gym: ${error.message}`);
    return (updated ? toCamelCaseObject(updated) : null) as Gym | null;
  },
};

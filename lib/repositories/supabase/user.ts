import type { UserRepository } from '../interfaces';
import type { User } from '@/types/user';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { toCamelCaseObject, toSnakeCaseObject } from '@/lib/repositories/supabase/transform';

export const supabaseUserRepository: UserRepository = {
  async findById(id) {
    assertSupabaseConfigured();
    const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`Failed to load user: ${error.message}`);
    return (data ? toCamelCaseObject(data) : null) as User | null;
  },

  async findByEmail(email) {
    assertSupabaseConfigured();
    const { data, error } = await supabase.from('users').select('*').ilike('email', email).maybeSingle();
    if (error) throw new Error(`Failed to lookup user by email: ${error.message}`);
    return (data ? toCamelCaseObject(data) : null) as User | null;
  },

  async findByGymId(gymId) {
    assertSupabaseConfigured();
    const { data, error } = await supabase.from('users').select('*').eq('gym_id', gymId).order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to load gym users: ${error.message}`);
    return (data ?? []).map((row) => toCamelCaseObject(row)) as User[];
  },

  async create(user) {
    assertSupabaseConfigured();
    const payload = toSnakeCaseObject(user);
    const { data, error } = await supabase.from('users').insert(payload).select().single();
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return toCamelCaseObject(data) as User;
  },

  async update(id, data) {
    assertSupabaseConfigured();
    const payload = toSnakeCaseObject({ ...data, updatedAt: new Date().toISOString() });
    const { data: updated, error } = await supabase
      .from('users')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Failed to update user: ${error.message}`);
    return (updated ? toCamelCaseObject(updated) : null) as User | null;
  },
};

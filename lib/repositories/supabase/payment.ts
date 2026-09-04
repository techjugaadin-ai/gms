import type { PaymentRepository } from '../interfaces';
import type { Payment } from '@/types/payment';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { toCamelCaseObject, toSnakeCaseObject } from '@/lib/repositories/supabase/transform';

export const supabasePaymentRepository: PaymentRepository = {
  async findById(id, gymId) {
    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .eq('gym_id', gymId)
      .maybeSingle();
    if (error) throw new Error(`Failed to load payment: ${error.message}`);
    return (data ? toCamelCaseObject(data) : null) as Payment | null;
  },

  async findByGymId(gymId) {
    assertSupabaseConfigured();
    const { data, error } = await supabase.from('payments').select('*').eq('gym_id', gymId).order('payment_date', { ascending: false });
    if (error) throw new Error(`Failed to load payments: ${error.message}`);
    return (data ?? []).map((row) => toCamelCaseObject(row)) as Payment[];
  },

  async findByMemberId(memberId, gymId) {
    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('member_id', memberId)
      .eq('gym_id', gymId)
      .order('payment_date', { ascending: false });
    if (error) throw new Error(`Failed to load member payments: ${error.message}`);
    return (data ?? []).map((row) => toCamelCaseObject(row)) as Payment[];
  },

  async create(payment) {
    assertSupabaseConfigured();
    const payload = toSnakeCaseObject(payment);
    const { data, error } = await supabase.from('payments').insert(payload).select().single();
    if (error) throw new Error(`Failed to create payment: ${error.message}`);
    return toCamelCaseObject(data) as Payment;
  },
};

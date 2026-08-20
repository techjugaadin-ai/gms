import { planRepo } from '@/lib/repositories';
import { generateId } from '@/lib/utils/id';
import type { CreateMembershipPlanInput, UpdateMembershipPlanInput } from '@/lib/validation/schemas';
import type { MembershipPlan } from '@/types/membership-plan';

export async function getMembershipPlans(gymId: string) {
  return planRepo.findByGymId(gymId);
}

export async function createMembershipPlan(gymId: string, input: CreateMembershipPlanInput): Promise<MembershipPlan> {
  const now = new Date().toISOString();
  const plan: MembershipPlan = {
    id: generateId('plan'),
    gymId,
    name: input.name,
    durationMonths: input.durationMonths,
    price: input.price,
    active: input.active ?? true,
    createdAt: now,
    updatedAt: now,
  };
  return planRepo.create(plan);
}

export async function updateMembershipPlan(id: string, gymId: string, input: UpdateMembershipPlanInput) {
  const plan = await planRepo.findById(id, gymId);
  if (!plan) throw new Error('PLAN_NOT_FOUND');
  return planRepo.update(id, gymId, input);
}

export async function deleteMembershipPlan(id: string, gymId: string) {
  const plan = await planRepo.findById(id, gymId);
  if (!plan) throw new Error('PLAN_NOT_FOUND');
  return planRepo.delete(id, gymId);
}

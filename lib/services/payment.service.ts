import { paymentRepo, memberRepo, planRepo } from '@/lib/repositories';
import { generateId } from '@/lib/utils/id';
import { addMonths, toISODateString } from '@/lib/utils/date';
import type { CreatePaymentInput } from '@/lib/validation/schemas';
import type { Payment } from '@/types/payment';

export async function getPayments(gymId: string) {
  return paymentRepo.findByGymId(gymId);
}

export async function getMemberPayments(memberId: string, gymId: string) {
  return paymentRepo.findByMemberId(memberId, gymId);
}

export async function recordPayment(gymId: string, input: CreatePaymentInput): Promise<Payment> {
  const member = await memberRepo.findById(input.memberId, gymId);
  if (!member) throw new Error('MEMBER_NOT_FOUND');

  const plan = await planRepo.findById(input.planId, gymId);
  if (!plan) throw new Error('PLAN_NOT_FOUND');

  const now = new Date().toISOString();
  const payment: Payment = {
    id: generateId('pay'),
    gymId,
    memberId: input.memberId,
    planId: input.planId,
    amount: input.amount,
    paymentDate: input.paymentDate,
    paymentType: input.paymentType,
    notes: input.notes,
    createdAt: now,
  };

  const saved = await paymentRepo.create(payment);

  // Extend membership from the later of today or current end date
  const base = new Date(member.membershipEndDate) > new Date() ? new Date(member.membershipEndDate) : new Date();
  const newEnd = addMonths(base, plan.durationMonths);
  await memberRepo.update(input.memberId, gymId, {
    membershipPlanId: input.planId,
    membershipEndDate: toISODateString(newEnd),
  });

  return saved;
}

import { memberRepo, planRepo, paymentRepo } from '@/lib/repositories';
import { generateId, generateMemberId, generateReferralCode } from '@/lib/utils/id';
import { addMonths, toISODateString } from '@/lib/utils/date';
import type { CreateMemberInput, UpdateMemberInput } from '@/lib/validation/schemas';
import type { Member } from '@/types/member';

export async function getMembers(gymId: string) {
  return memberRepo.findByGymId(gymId);
}

export async function getMemberById(id: string, gymId: string) {
  return memberRepo.findById(id, gymId);
}

export async function createMember(gymId: string, input: CreateMemberInput): Promise<Member> {
  const existing = await memberRepo.findByGymId(gymId);
  const sequenceNumber = existing.length + 1;

  const gymPrefix = gymId.split('_')[1]?.toUpperCase().slice(0, 6) ?? 'GYM';
  const memberId = generateMemberId(gymPrefix, sequenceNumber);

  const plan = await planRepo.findById(input.membershipPlanId, gymId);
  if (!plan) throw new Error('PLAN_NOT_FOUND');

  const startDate = new Date(input.joiningDate);
  const endDate = addMonths(startDate, plan.durationMonths);

  const now = new Date().toISOString();
  const member: Member = {
    id: memberId,
    gymId,
    name: input.name,
    gender: input.gender,
    phone: input.phone,
    email: input.email || undefined,
    address: input.address,
    permanentAddress: input.permanentAddress,
    emergencyContact: input.emergencyContact,
    weight: input.weight,
    height: input.height,
    medicalInfo: input.medicalInfo,
    membershipPlanId: input.membershipPlanId,
    joiningDate: input.joiningDate,
    membershipStartDate: toISODateString(startDate),
    membershipEndDate: toISODateString(endDate),
    referralCode: generateReferralCode(input.name),
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };

  return memberRepo.create(member);
}

export async function updateMember(id: string, gymId: string, input: UpdateMemberInput) {
  const member = await memberRepo.findById(id, gymId);
  if (!member) throw new Error('MEMBER_NOT_FOUND');

  const updates: Partial<Member> = { ...input };

  if (input.membershipPlanId && input.membershipPlanId !== member.membershipPlanId) {
    const plan = await planRepo.findById(input.membershipPlanId, gymId);
    if (!plan) throw new Error('PLAN_NOT_FOUND');
    const start = new Date(member.membershipStartDate);
    const end = addMonths(start, plan.durationMonths);
    updates.membershipEndDate = toISODateString(end);
  }

  return memberRepo.update(id, gymId, updates);
}

export async function deleteMember(id: string, gymId: string) {
  const member = await memberRepo.findById(id, gymId);
  if (!member) throw new Error('MEMBER_NOT_FOUND');
  return memberRepo.softDelete(id, gymId);
}

export async function getMemberWithPayments(id: string, gymId: string) {
  const member = await memberRepo.findById(id, gymId);
  if (!member) throw new Error('MEMBER_NOT_FOUND');
  const payments = await paymentRepo.findByMemberId(id, gymId);
  const plan = await planRepo.findById(member.membershipPlanId, gymId);
  return { member, payments, plan };
}

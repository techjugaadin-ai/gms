import type { MembershipPlanRepository } from '../interfaces';
import type { MembershipPlan } from '@/types/membership-plan';
import { readJsonFile, writeJsonFile } from './base';

const FILE = 'membership-plans.json';

export const jsonMembershipPlanRepository: MembershipPlanRepository = {
  async findById(id, gymId) {
    const plans = readJsonFile<MembershipPlan>(FILE);
    return plans.find((p) => p.id === id && p.gymId === gymId) ?? null;
  },

  async findByGymId(gymId) {
    const plans = readJsonFile<MembershipPlan>(FILE);
    return plans.filter((p) => p.gymId === gymId);
  },

  async create(plan) {
    const plans = readJsonFile<MembershipPlan>(FILE);
    plans.push(plan);
    writeJsonFile(FILE, plans);
    return plan;
  },

  async update(id, gymId, data) {
    const plans = readJsonFile<MembershipPlan>(FILE);
    const idx = plans.findIndex((p) => p.id === id && p.gymId === gymId);
    if (idx === -1) return null;
    plans[idx] = { ...plans[idx], ...data, updatedAt: new Date().toISOString() };
    writeJsonFile(FILE, plans);
    return plans[idx];
  },

  async delete(id, gymId) {
    const plans = readJsonFile<MembershipPlan>(FILE);
    const idx = plans.findIndex((p) => p.id === id && p.gymId === gymId);
    if (idx === -1) return false;
    plans[idx] = { ...plans[idx], active: false, updatedAt: new Date().toISOString() };
    writeJsonFile(FILE, plans);
    return true;
  },
};

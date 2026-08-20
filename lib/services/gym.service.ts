import { gymRepo } from '@/lib/repositories';
import type { UpdateGymInput, UpdateSubscriptionInput } from '@/lib/validation/schemas';

export async function getGym(gymId: string) {
  return gymRepo.findById(gymId);
}

export async function updateGym(gymId: string, input: UpdateGymInput) {
  const gym = await gymRepo.findById(gymId);
  if (!gym) throw new Error('GYM_NOT_FOUND');
  return gymRepo.update(gymId, input);
}

export async function updateGymStatus(gymId: string, status: 'active' | 'suspended') {
  const gym = await gymRepo.findById(gymId);
  if (!gym) throw new Error('GYM_NOT_FOUND');
  return gymRepo.update(gymId, { status });
}

export async function updateSubscription(gymId: string, input: UpdateSubscriptionInput) {
  const gym = await gymRepo.findById(gymId);
  if (!gym) throw new Error('GYM_NOT_FOUND');
  return gymRepo.update(gymId, input);
}

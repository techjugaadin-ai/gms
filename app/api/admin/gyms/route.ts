import { getCurrentUser } from '@/lib/auth/session';
import { gymRepo, memberRepo } from '@/lib/repositories';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'SUPER_ADMIN') {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }
  
  const gyms = await gymRepo.findAll();
  
  // Get member count for each gym
  const gymsWithMemberCounts = await Promise.all(
    gyms.map(async (gym) => {
      const members = await memberRepo.findByGymId(gym.id);
      return {
        ...gym,
        memberCount: members.length,
      };
    })
  );
  
  return successResponse(gymsWithMemberCounts);
}

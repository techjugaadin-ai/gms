import { getCurrentUser } from '@/lib/auth/session';
import { getGym } from '@/lib/services/gym.service';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);
  
  let gym = null;
  if (user.gymId) {
    try {
      gym = await getGym(user.gymId);
    } catch {
      // Gym not found, that's okay
    }
  }
  
  return successResponse({ user, gym });
}

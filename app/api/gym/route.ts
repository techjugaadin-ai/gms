import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getGym, updateGym } from '@/lib/services/gym.service';
import { UpdateGymSchema } from '@/lib/validation/schemas';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER' || !user.gymId) {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }
  const gym = await getGym(user.gymId);
  if (!gym) return errorResponse('GYM_NOT_FOUND', 'Gym not found', 404);
  return successResponse(gym);
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER' || !user.gymId) {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }
  try {
    const body = await req.json();
    const parsed = UpdateGymSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message);
    }
    const updated = await updateGym(user.gymId, parsed.data);
    return successResponse(updated);
  } catch {
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}

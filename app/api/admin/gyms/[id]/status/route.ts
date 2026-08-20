import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { updateGymStatus } from '@/lib/services/gym.service';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== 'SUPER_ADMIN') {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }
  try {
    const body = await req.json();
    const status = body.status as 'active' | 'suspended';
    if (status !== 'active' && status !== 'suspended') {
      return errorResponse('VALIDATION_ERROR', 'Status must be active or suspended');
    }
    const updated = await updateGymStatus(id, status);
    return successResponse(updated);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg === 'GYM_NOT_FOUND') return errorResponse('GYM_NOT_FOUND', 'Gym not found', 404);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}

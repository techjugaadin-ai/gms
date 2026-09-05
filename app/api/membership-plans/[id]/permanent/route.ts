import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { planRepo } from '@/lib/repositories';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER' || !user.gymId) {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }

  try {
    // Verify the plan belongs to this gym
    const plan = await planRepo.findById(id, user.gymId);
    if (!plan) {
      return errorResponse('PLAN_NOT_FOUND', 'Plan not found', 404);
    }

    // Permanently delete the plan
    await planRepo.hardDelete(id, user.gymId);

    return successResponse({ message: 'Plan deleted permanently' });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg === 'PLAN_NOT_FOUND') return errorResponse('PLAN_NOT_FOUND', 'Plan not found', 404);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}

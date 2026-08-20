import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { updateMembershipPlan, deleteMembershipPlan } from '@/lib/services/membership-plan.service';
import { UpdateMembershipPlanSchema } from '@/lib/validation/schemas';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER' || !user.gymId) {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }
  try {
    const body = await req.json();
    const parsed = UpdateMembershipPlanSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message);
    }
    const updated = await updateMembershipPlan(id, user.gymId, parsed.data);
    if (!updated) return errorResponse('PLAN_NOT_FOUND', 'Plan not found', 404);
    return successResponse(updated);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg === 'PLAN_NOT_FOUND') return errorResponse('PLAN_NOT_FOUND', 'Plan not found', 404);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER' || !user.gymId) {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }
  try {
    await deleteMembershipPlan(id, user.gymId);
    return successResponse({ message: 'Plan deactivated' });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg === 'PLAN_NOT_FOUND') return errorResponse('PLAN_NOT_FOUND', 'Plan not found', 404);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}

import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import {
  getMembershipPlans,
  createMembershipPlan,
} from '@/lib/services/membership-plan.service';
import { CreateMembershipPlanSchema } from '@/lib/validation/schemas';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER' || !user.gymId) {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }
  const plans = await getMembershipPlans(user.gymId);
  return successResponse(plans);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER' || !user.gymId) {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }
  try {
    const body = await req.json();
    const parsed = CreateMembershipPlanSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message);
    }
    const plan = await createMembershipPlan(user.gymId, parsed.data);
    return successResponse(plan, 201);
  } catch {
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}

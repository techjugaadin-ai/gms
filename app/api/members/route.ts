import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getMembers, createMember } from '@/lib/services/member.service';
import { CreateMemberSchema } from '@/lib/validation/schemas';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER' || !user.gymId) {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }
  const members = await getMembers(user.gymId);
  
  // Strict validation: ensure all returned members belong to the current user's gym
  const validated = members.filter((m: any) => m.gymId === user.gymId);
  if (validated.length !== members.length) {
    console.error('[SECURITY] Data mismatch detected! user.gymId:', user.gymId, 'returned:', members.length, 'validated:', validated.length);
  }
  
  console.log('[GET /api/members] user:', user.email, 'gymId:', user.gymId, 'returned:', validated.length);
  return successResponse(validated);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER' || !user.gymId) {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }
  try {
    const body = await req.json();
    const parsed = CreateMemberSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message);
    }
    const member = await createMember(user.gymId, parsed.data);
    return successResponse(member, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg === 'PLAN_NOT_FOUND') return errorResponse('PLAN_NOT_FOUND', 'Membership plan not found', 404);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}

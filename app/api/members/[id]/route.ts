import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getMemberById, updateMember, deleteMember } from '@/lib/services/member.service';
import { UpdateMemberSchema } from '@/lib/validation/schemas';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER' || !user.gymId) {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }
  const member = await getMemberById(id, user.gymId);
  if (!member) return errorResponse('MEMBER_NOT_FOUND', 'Member not found', 404);
  return successResponse(member);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER' || !user.gymId) {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }
  try {
    const body = await req.json();
    const parsed = UpdateMemberSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message);
    }
    const updated = await updateMember(id, user.gymId, parsed.data);
    if (!updated) return errorResponse('MEMBER_NOT_FOUND', 'Member not found', 404);
    return successResponse(updated);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg === 'MEMBER_NOT_FOUND') return errorResponse('MEMBER_NOT_FOUND', 'Member not found', 404);
    if (msg === 'PLAN_NOT_FOUND') return errorResponse('PLAN_NOT_FOUND', 'Membership plan not found', 404);
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
    await deleteMember(id, user.gymId);
    return successResponse({ message: 'Member deleted' });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg === 'MEMBER_NOT_FOUND') return errorResponse('MEMBER_NOT_FOUND', 'Member not found', 404);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}

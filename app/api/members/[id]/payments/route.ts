import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getMemberPayments } from '@/lib/services/payment.service';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER' || !user.gymId) {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }
  const payments = await getMemberPayments(id, user.gymId);
  return successResponse(payments);
}

import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getPayments, recordPayment } from '@/lib/services/payment.service';
import { CreatePaymentSchema } from '@/lib/validation/schemas';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER' || !user.gymId) {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }
  const payments = await getPayments(user.gymId);
  return successResponse(payments);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER' || !user.gymId) {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }
  try {
    const body = await req.json();
    const parsed = CreatePaymentSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message);
    }
    const payment = await recordPayment(user.gymId, parsed.data);
    return successResponse(payment, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg === 'MEMBER_NOT_FOUND') return errorResponse('MEMBER_NOT_FOUND', 'Member not found', 404);
    if (msg === 'PLAN_NOT_FOUND') return errorResponse('PLAN_NOT_FOUND', 'Membership plan not found', 404);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}

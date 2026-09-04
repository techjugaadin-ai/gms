import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getNotifications, markNotificationRead } from '@/lib/services/notification.service';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER' || !user.gymId) {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }
  const notifications = await getNotifications(user.gymId);
  // Extra safety: ensure returned notifications belong to the requesting gym
  const filtered = (notifications || []).filter((n: any) => n.gymId === user.gymId);
  console.log('[GET /api/notifications] user.gymId=', user.gymId, 'returned=', filtered.length, 'totalFetched=', (notifications || []).length);
  if ((notifications || []).length > 0) {
    console.log('[GET /api/notifications] sample gymIds=', Array.from(new Set((notifications || []).slice(0, 10).map((x: any) => x.gymId))));
  }
  return successResponse(filtered);
}

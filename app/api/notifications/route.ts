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
  return successResponse(notifications);
}

import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { markNotificationRead } from '@/lib/services/notification.service';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER' || !user.gymId) {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }
  const ok = await markNotificationRead(id, user.gymId);
  if (!ok) return errorResponse('NOT_FOUND', 'Notification not found', 404);
  return successResponse({ message: 'Marked as read' });
}

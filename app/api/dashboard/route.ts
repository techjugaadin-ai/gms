import { getCurrentUser } from '@/lib/auth/session';
import { getDashboardMetrics } from '@/lib/services/dashboard.service';
import { generateNotificationsForGym } from '@/lib/services/notification.service';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER' || !user.gymId) {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }
  // Generate fresh notifications on each dashboard load
  await generateNotificationsForGym(user.gymId);
  const metrics = await getDashboardMetrics(user.gymId);
  return successResponse(metrics);
}

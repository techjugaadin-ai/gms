import { getCurrentUser } from '@/lib/auth/session';
import { getDashboardMetrics } from '@/lib/services/dashboard.service';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER' || !user.gymId) {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }
  const metrics = await getDashboardMetrics(user.gymId);
  return successResponse(metrics);
}

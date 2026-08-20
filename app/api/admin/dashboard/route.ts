import { getCurrentUser } from '@/lib/auth/session';
import { getAdminDashboard, getAllGyms } from '@/lib/services/admin.service';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'SUPER_ADMIN') {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }
  const metrics = await getAdminDashboard();
  return successResponse(metrics);
}

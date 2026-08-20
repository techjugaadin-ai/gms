import { getCurrentUser } from '@/lib/auth/session';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);
  return successResponse({ user });
}

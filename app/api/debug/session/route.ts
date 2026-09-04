import { getCurrentUser } from '@/lib/auth/session';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return errorResponse('UNAUTHORIZED', 'No session', 401);
  }
  console.log('[DEBUG] Current session:', JSON.stringify(user));
  return successResponse({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    gymId: user.gymId,
  });
}

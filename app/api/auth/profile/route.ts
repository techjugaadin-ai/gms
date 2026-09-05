import { getCurrentUser } from '@/lib/auth/session';
import { userRepo } from '@/lib/repositories';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);

  const { name, email } = await request.json();

  if (!name?.trim() || !email?.trim()) {
    return errorResponse('VALIDATION_ERROR', 'Name and email are required');
  }

  // Check if email is already taken by another user
  if (email !== user.email) {
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) {
      return errorResponse('EMAIL_TAKEN', 'Email already in use');
    }
  }

  const updatedUser = await userRepo.update(user.id, { name, email });
  if (!updatedUser) {
    return errorResponse('UPDATE_FAILED', 'Failed to update profile');
  }

  return successResponse({
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    },
  });
}

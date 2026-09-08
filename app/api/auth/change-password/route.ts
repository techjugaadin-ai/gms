import { getCurrentUser, invalidateAllUserSessions, clearSessionCookie } from '@/lib/auth/session';
import { userRepo } from '@/lib/repositories';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);

  const { oldPassword, newPassword, confirmPassword } = await request.json();

  // Validation
  if (!oldPassword?.trim() || !newPassword?.trim() || !confirmPassword?.trim()) {
    return errorResponse('VALIDATION_ERROR', 'All fields are required');
  }

  if (newPassword.length < 8) {
    return errorResponse('VALIDATION_ERROR', 'New password must be at least 8 characters');
  }

  if (newPassword !== confirmPassword) {
    return errorResponse('VALIDATION_ERROR', 'Passwords do not match');
  }

  // Fetch user with password hash
  const currentUser = await userRepo.findById(user.id);
  if (!currentUser) {
    return errorResponse('USER_NOT_FOUND', 'User not found');
  }

  // Verify old password
  const isPasswordCorrect = await verifyPassword(oldPassword, currentUser.passwordHash);
  if (!isPasswordCorrect) {
    return errorResponse('INVALID_PASSWORD', 'Current password is incorrect');
  }

  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);

  // Update password
  const updatedUser = await userRepo.update(user.id, { passwordHash: newPasswordHash });
  if (!updatedUser) {
    return errorResponse('UPDATE_FAILED', 'Failed to change password');
  }

  // Invalidate all sessions for this user (logout from all devices)
  await invalidateAllUserSessions(user.id);
  await clearSessionCookie();

  return successResponse({ message: 'Password changed successfully. Please login again.' });
}

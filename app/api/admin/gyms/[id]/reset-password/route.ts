import { NextRequest } from 'next/server';
import { getCurrentUser, invalidateAllUserSessions } from '@/lib/auth/session';
import { userRepo, gymRepo } from '@/lib/repositories';
import { hashPassword } from '@/lib/auth/password';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'SUPER_ADMIN') {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }

  try {
    const body = await req.json();
    const newPassword = body.newPassword as string;

    if (!newPassword || newPassword.trim().length === 0) {
      return errorResponse('VALIDATION_ERROR', 'Password is required');
    }

    if (newPassword.length < 6) {
      return errorResponse('VALIDATION_ERROR', 'Password must be at least 6 characters');
    }

    // Find the gym
    const gym = await gymRepo.findById(id);
    if (!gym) {
      return errorResponse('GYM_NOT_FOUND', 'Gym not found', 404);
    }

    // Find the gym owner user
    const gymOwners = await userRepo.findByGymId(id);
    if (gymOwners.length === 0) {
      return errorResponse('USER_NOT_FOUND', 'Gym owner not found', 404);
    }

    const owner = gymOwners[0]; // Get the first (primary) owner

    // Hash the new password
    const passwordHash = await hashPassword(newPassword);

    // Update the user's password
    const updated = await userRepo.update(owner.id, { passwordHash });

    if (!updated) {
      return errorResponse('UPDATE_FAILED', 'Failed to update password', 500);
    }

    // Invalidate all sessions for the gym owner (logout from all devices)
    await invalidateAllUserSessions(owner.id);

    return successResponse({ message: 'Password reset successfully. Gym owner has been logged out from all devices.' });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('Error resetting password:', msg);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}

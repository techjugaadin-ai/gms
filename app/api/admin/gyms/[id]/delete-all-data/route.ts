import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { gymRepo, memberRepo, planRepo } from '@/lib/repositories';
import { supabase } from '@/lib/supabase/client';
import { successResponse, errorResponse } from '@/lib/utils/api';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'SUPER_ADMIN') {
      return errorResponse('UNAUTHORIZED', 'Unauthorized', 401);
    }

    // Verify gym exists
    const gym = await gymRepo.findById(id);
    if (!gym) {
      return errorResponse('NOT_FOUND', 'Gym not found', 404);
    }

    // Delete all data associated with the gym
    // 1. Delete all members for this gym (hard delete)
    await supabase.from('members').delete().eq('gym_id', id);

    // 2. Delete all payments for this gym
    await supabase.from('payments').delete().eq('gym_id', id);

    // 3. Delete all membership plans for this gym
    const plans = await planRepo.findByGymId(id);
    for (const plan of plans) {
      await planRepo.hardDelete(plan.id, id);
    }

    // 4. Delete the gym owner user account
    if (gym.ownerId) {
      await supabase.from('users').delete().eq('id', gym.ownerId);
    }

    // 5. Delete the gym itself
    await supabase.from('gyms').delete().eq('id', id);

    return successResponse({ message: 'Gym and all associated data deleted successfully' });
  } catch (error: any) {
    console.error('Delete gym data error:', error);
    return errorResponse('SERVER_ERROR', error.message || 'Failed to delete gym data', 500);
  }
}

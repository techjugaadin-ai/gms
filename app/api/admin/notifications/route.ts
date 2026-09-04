import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { gymRepo } from '@/lib/repositories';
import { errorResponse, successResponse } from '@/lib/utils/api';

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole('SUPER_ADMIN');

    const gyms = await gymRepo.findAll();
    const today = new Date();
    const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    const notifications: Array<{
      id: string;
      type: 'SUBSCRIPTION_EXPIRING_SOON' | 'SUBSCRIPTION_EXPIRED';
      gymId: string;
      gymName: string;
      message: string;
      daysUntilExpiry: number;
      subscriptionEndDate: string;
      severity: 'warning' | 'error';
    }> = [];

    for (const gym of gyms) {
      if (gym.status !== 'active') continue;

      const endDate = new Date(`${gym.subscriptionEndDate}T00:00:00Z`);
      const diffDays = Math.round((endDate.getTime() - todayUtc) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        // Expired
        notifications.push({
          id: `notif_${gym.id}_expired`,
          type: 'SUBSCRIPTION_EXPIRED',
          gymId: gym.id,
          gymName: gym.name,
          message: `${gym.name}'s subscription expired ${Math.abs(diffDays)} days ago`,
          daysUntilExpiry: diffDays,
          subscriptionEndDate: gym.subscriptionEndDate,
          severity: 'error',
        });
      } else if (diffDays <= 7) {
        // Expiring soon
        const days = diffDays === 0 ? 'today' : diffDays === 1 ? 'tomorrow' : `in ${diffDays} days`;
        notifications.push({
          id: `notif_${gym.id}_expiring`,
          type: 'SUBSCRIPTION_EXPIRING_SOON',
          gymId: gym.id,
          gymName: gym.name,
          message: `${gym.name}'s subscription expires ${days}`,
          daysUntilExpiry: diffDays,
          subscriptionEndDate: gym.subscriptionEndDate,
          severity: 'warning',
        });
      }
    }

    // Sort by severity (errors first) and days until expiry
    notifications.sort((a, b) => {
      if (a.severity !== b.severity) {
        return a.severity === 'error' ? -1 : 1;
      }
      return a.daysUntilExpiry - b.daysUntilExpiry;
    });

    return successResponse(notifications);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return errorResponse('FORBIDDEN', 'Only super admin can access this', 403);
    }
    console.error('[admin/notifications]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to load notifications', 500);
  }
}

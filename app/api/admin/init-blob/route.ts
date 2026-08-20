/**
 * Initialize Blob Storage with data from JSON files
 * This route seeds Vercel Blob with initial data on first deployment
 * 
 * Usage: GET /api/admin/init-blob
 * Returns: Status and count of initialized collections
 */

import { storeBlobData } from '@/lib/storage/blob-adapter';
import { readJsonFile } from '@/lib/repositories/json-file/base';
import type { Gym } from '@/types/gym';
import type { User } from '@/types/user';
import type { Member } from '@/types/member';
import type { MembershipPlan } from '@/types/membership-plan';
import type { Payment } from '@/types/payment';
import type { Notification } from '@/types/notification';
import { successResponse, errorResponse } from '@/lib/utils/api';
import { getCurrentUser } from '@/lib/auth/session';

interface InitResult {
  collection: string;
  count: number;
  success: boolean;
  error?: string;
}

export async function GET() {
  // Only allow super admin to initialize blob storage
  const user = await getCurrentUser();
  if (!user || user.role !== 'SUPER_ADMIN') {
    return errorResponse('UNAUTHORIZED', 'Only super admin can initialize blob storage', 401);
  }

  // Only run if blob storage is enabled
  if (process.env.STORAGE_MODE !== 'blob') {
    return errorResponse('INVALID_CONFIG', 'Blob storage is not enabled (STORAGE_MODE !== "blob")', 400);
  }

  const results: InitResult[] = [];

  try {
    // Initialize Gyms
    try {
      const gyms = readJsonFile<Gym>('gyms.json');
      await storeBlobData('gyms', gyms);
      results.push({
        collection: 'gyms',
        count: gyms.length,
        success: true,
      });
      console.log(`[init-blob] ✓ Initialized ${gyms.length} gyms`);
    } catch (error) {
      results.push({
        collection: 'gyms',
        count: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
      console.error('[init-blob] Failed to initialize gyms:', error);
    }

    // Initialize Users
    try {
      const users = readJsonFile<User>('users.json');
      await storeBlobData('users', users);
      results.push({
        collection: 'users',
        count: users.length,
        success: true,
      });
      console.log(`[init-blob] ✓ Initialized ${users.length} users`);
    } catch (error) {
      results.push({
        collection: 'users',
        count: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
      console.error('[init-blob] Failed to initialize users:', error);
    }

    // Initialize Members
    try {
      const members = readJsonFile<Member>('members.json');
      await storeBlobData('members', members);
      results.push({
        collection: 'members',
        count: members.length,
        success: true,
      });
      console.log(`[init-blob] ✓ Initialized ${members.length} members`);
    } catch (error) {
      results.push({
        collection: 'members',
        count: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
      console.error('[init-blob] Failed to initialize members:', error);
    }

    // Initialize Membership Plans
    try {
      const plans = readJsonFile<MembershipPlan>('membership-plans.json');
      await storeBlobData('membership-plans', plans);
      results.push({
        collection: 'membership-plans',
        count: plans.length,
        success: true,
      });
      console.log(`[init-blob] ✓ Initialized ${plans.length} membership plans`);
    } catch (error) {
      results.push({
        collection: 'membership-plans',
        count: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
      console.error('[init-blob] Failed to initialize membership plans:', error);
    }

    // Initialize Payments
    try {
      const payments = readJsonFile<Payment>('payments.json');
      await storeBlobData('payments', payments);
      results.push({
        collection: 'payments',
        count: payments.length,
        success: true,
      });
      console.log(`[init-blob] ✓ Initialized ${payments.length} payments`);
    } catch (error) {
      results.push({
        collection: 'payments',
        count: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
      console.error('[init-blob] Failed to initialize payments:', error);
    }

    // Initialize Notifications
    try {
      const notifications = readJsonFile<Notification>('notifications.json');
      await storeBlobData('notifications', notifications);
      results.push({
        collection: 'notifications',
        count: notifications.length,
        success: true,
      });
      console.log(`[init-blob] ✓ Initialized ${notifications.length} notifications`);
    } catch (error) {
      results.push({
        collection: 'notifications',
        count: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
      console.error('[init-blob] Failed to initialize notifications:', error);
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    console.log(
      `[init-blob] ✓ Initialization complete: ${successCount} successful, ${failureCount} failed`
    );

    return successResponse(
      {
        message: 'Blob storage initialization complete',
        summary: {
          successful: successCount,
          failed: failureCount,
        },
        results,
      },
      200
    );
  } catch (error) {
    console.error('[init-blob] Unexpected error during initialization:', error);
    return errorResponse(
      'INIT_ERROR',
      error instanceof Error ? error.message : 'Unknown error during blob initialization',
      500
    );
  }
}

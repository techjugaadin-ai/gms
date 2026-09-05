import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { gymRepo, userRepo } from '@/lib/repositories';
import { hashPassword } from '@/lib/auth/password';
import { OnboardGymSchema } from '@/lib/validation/schemas';
import { errorResponse, successResponse } from '@/lib/utils/api';
import { generateId } from '@/lib/utils/id';

export async function POST(req: NextRequest) {
  try {
    // Only SUPER_ADMIN can create gyms
    const user = await getCurrentUser();
    if (!user || user.role !== 'SUPER_ADMIN') {
      return errorResponse('UNAUTHORIZED', 'Only super admin can onboard gyms', 401);
    }

    const body = await req.json();
    const parsed = OnboardGymSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message, 400);
    }

    const { gymName, ownerName, ownerEmail, password, phone, address, currency, subscriptionPlan, subscriptionStartDate, subscriptionEndDate, subscriptionAmount } = parsed.data;

    // Check if email already exists
    const existingUser = await userRepo.findByEmail(ownerEmail);
    if (existingUser) {
      return errorResponse('EMAIL_ALREADY_EXISTS', 'Email already registered', 400);
    }

    // Create gym
    const gymId = generateId('gym');
    const newGym = await gymRepo.create({
      id: gymId,
      name: gymName,
      ownerId: '', // Will be updated after user creation
      phone,
      email: ownerEmail,
      address,
      currency,
      status: 'active',
      subscriptionPlan: subscriptionPlan as any,
      subscriptionStartDate,
      subscriptionEndDate,
      paymentStatus: 'paid',
      subscriptionAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create gym owner user
    const userId = generateId('user');
    const newUser = await userRepo.create({
      id: userId,
      gymId,
      name: ownerName,
      email: ownerEmail,
      passwordHash,
      role: 'GYM_OWNER',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Update gym with owner ID
    await gymRepo.update(gymId, { ownerId: userId });

    console.log('[ONBOARD_GYM] Gym created:', gymId, 'Owner:', ownerEmail);

    return successResponse({
      gym: newGym,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      message: 'Gym and owner account created successfully',
    });
  } catch (error) {
    console.error('[ONBOARD_GYM_ERROR]', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to onboard gym', 500);
  }
}

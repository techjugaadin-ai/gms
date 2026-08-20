import { NextRequest, NextResponse } from 'next/server';
import { userRepo } from '@/lib/repositories';
import { verifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { LoginSchema } from '@/lib/validation/schemas';
import { errorResponse } from '@/lib/utils/api';

const SESSION_COOKIE = 'gms_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message);
    }

    const { email, password } = parsed.data;
    const user = await userRepo.findByEmail(email);
    if (!user || !user.active) {
      return errorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return errorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    const sessionUser = { id: user.id, gymId: user.gymId, name: user.name, email: user.email, role: user.role };
    const sessionId = await createSession(sessionUser);

    // Create response and set cookie header
    const response = NextResponse.json(
      { success: true, data: { user: sessionUser } },
      { status: 200 }
    );

    // Set cookie with proper options
    response.cookies.set({
      name: SESSION_COOKIE,
      value: sessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_MS / 1000,
      path: '/',
    });

    return response;
  } catch {
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}

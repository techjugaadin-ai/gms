import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { destroySession } from '@/lib/auth/session';

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('gms_session')?.value;
  if (sessionId) await destroySession(sessionId);
  
  // Create response and clear the cookie
  const response = NextResponse.json({ success: true, data: { message: 'Logged out' } }, { status: 200 });
  response.cookies.delete('gms_session');
  
  return response;
}

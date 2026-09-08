import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import type { SessionUser } from '@/types/user';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { gymRepo } from '@/lib/repositories';

const SESSION_COOKIE = 'gms_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const SESSIONS_TABLE = 'sessions';

const sessionsCache = new Map<string, { user: SessionUser; expiresAt: number }>();

async function saveSession(sessionId: string, user: SessionUser, expiresAt: number) {
  try {
    if (!isSupabaseConfigured) {
      sessionsCache.set(sessionId, { user, expiresAt });
      return;
    }

    const sessionData = {
      id: sessionId,
      user_data: user,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.from(SESSIONS_TABLE).upsert(sessionData, { onConflict: 'id' });
    if (error) throw new Error(error.message);

    sessionsCache.set(sessionId, { user, expiresAt });
  } catch (error) {
    console.error('[saveSession] Failed to save session in Supabase:', error);
    sessionsCache.set(sessionId, { user, expiresAt });
  }
}

async function loadSession(sessionId: string): Promise<{ user: SessionUser; expiresAt: number } | null> {
  try {
    const cached = sessionsCache.get(sessionId);
    if (cached) return cached;

    if (!isSupabaseConfigured) {
      return null;
    }

    const { data, error } = await supabase.from(SESSIONS_TABLE).select('*').eq('id', sessionId).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;

    const session = { user: data.user_data as SessionUser, expiresAt: Number(data.expires_at) };
    sessionsCache.set(sessionId, session);
    return session;
  } catch {
    return null;
  }
}

async function deleteSession(sessionId: string) {
  try {
    if (isSupabaseConfigured) {
      await supabase.from(SESSIONS_TABLE).delete().eq('id', sessionId);
    }
    sessionsCache.delete(sessionId);
  } catch {
    sessionsCache.delete(sessionId);
  }
}

async function deleteAllSessionsForUser(userId: string) {
  try {
    // Get all sessions for this user from database
    if (isSupabaseConfigured) {
      const { data: sessions, error: fetchError } = await supabase
        .from(SESSIONS_TABLE)
        .select('id')
        .filter('user_data->>id', 'eq', userId);

      if (fetchError) throw new Error(fetchError.message);

      // Delete all sessions for this user
      if (sessions && sessions.length > 0) {
        const sessionIds = sessions.map((s: any) => s.id);
        const { error: deleteError } = await supabase
          .from(SESSIONS_TABLE)
          .delete()
          .in('id', sessionIds);

        if (deleteError) throw new Error(deleteError.message);

        // Clear from cache
        sessionIds.forEach((id: string) => {
          sessionsCache.delete(id);
        });

        console.log(`[deleteAllSessionsForUser] Deleted ${sessionIds.length} sessions for user: ${userId}`);
      }
    } else {
      // Clear from cache only if not using Supabase
      for (const [key, value] of sessionsCache) {
        if (value.user.id === userId) {
          sessionsCache.delete(key);
        }
      }
    }
  } catch (error) {
    console.error('[deleteAllSessionsForUser] Failed to delete all sessions:', error);
    // Attempt cache cleanup anyway
    for (const [key, value] of sessionsCache) {
      if (value.user.id === userId) {
        sessionsCache.delete(key);
      }
    }
  }
}

export async function createSession(user: SessionUser): Promise<string> {
  const sessionId = uuidv4();
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  console.log('[createSession] Creating session for user:', user.email, 'sessionId:', sessionId);
  await saveSession(sessionId, user, expiresAt);
  console.log('[createSession] ✓ Session created:', sessionId, 'for user:', user.email);
  return sessionId;
}

export async function getSession(sessionId: string): Promise<SessionUser | null> {
  console.log('[getSession] Loading session:', sessionId);
  const entry = await loadSession(sessionId);
  console.log('[getSession] loadSession result:', entry ? '✓ found' : '✗ not found');
  if (!entry) {
    console.log('[getSession] ✗ No session entry for:', sessionId);
    return null;
  }
  if (entry.expiresAt < Date.now()) {
    console.log('[getSession] ✗ Session expired for:', sessionId);
    await deleteSession(sessionId);
    return null;
  }
  console.log('[getSession] ✓ Valid session for user:', entry.user.email);
  return entry.user;
}

export async function destroySession(sessionId: string): Promise<void> {
  await deleteSession(sessionId);
}

export async function invalidateAllUserSessions(userId: string): Promise<void> {
  await deleteAllSessionsForUser(userId);
}

export async function setSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS / 1000,
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  console.log('[getCurrentUser] Looking for session cookie:', SESSION_COOKIE);
  console.log('[getCurrentUser] sessionId from cookie:', sessionId ? '✓ found: ' + sessionId.substring(0, 8) : '✗ not found');
  if (!sessionId) {
    console.log('[getCurrentUser] ✗ No sessionId in cookie, redirecting to login');
    return null;
  }
  const user = await getSession(sessionId);
  if (user?.role === 'GYM_OWNER' && user.gymId) {
    const gym = await gymRepo.findById(user.gymId);
    const today = new Date();
    const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    const subscriptionEndUtc = gym?.subscriptionEndDate
      ? Date.parse(`${gym.subscriptionEndDate}T00:00:00Z`)
      : Number.NaN;

    if (!gym || gym.status !== 'active' || !Number.isFinite(subscriptionEndUtc) || subscriptionEndUtc < todayUtc) {
      await deleteSession(sessionId);
      await clearSessionCookie();
      return null;
    }
  }
  if (user) {
    console.log('[getCurrentUser] ✓ Valid session for user:', user.email, 'gymId:', user.gymId);
  } else {
    console.log('[getCurrentUser] ✗ Session not found or expired for sessionId:', sessionId.substring(0, 8));
  }
  return user;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}

export async function requireRole(role: SessionUser['role']): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== role) throw new Error('FORBIDDEN');
  return user;
}

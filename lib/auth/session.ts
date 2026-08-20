import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import type { SessionUser } from '@/types/user';
import { storeBlobData, retrieveBlobData, deleteBlobData, isBlobStorageEnabled } from '@/lib/storage/blob-adapter';

const SESSION_COOKIE = 'gms_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SESSIONS_DIR = path.join(process.cwd(), '.sessions');

// In-memory cache for performance (backup to file storage)
const sessionsCache = new Map<string, { user: SessionUser; expiresAt: number }>();

async function ensureSessionsDir() {
  try {
    await fs.mkdir(SESSIONS_DIR, { recursive: true });
  } catch {
    // Directory already exists
  }
}

async function saveSession(sessionId: string, user: SessionUser, expiresAt: number) {
  try {
    const sessionData = { user, expiresAt };
    
    // Use Blob storage if enabled
    if (isBlobStorageEnabled()) {
      await storeBlobData(`session:${sessionId}`, sessionData, expiresAt);
      sessionsCache.set(sessionId, sessionData);
      return;
    }

    // Fallback to file system storage
    await ensureSessionsDir();
    const sessionFile = path.join(SESSIONS_DIR, `${sessionId}.json`);
    await fs.writeFile(sessionFile, JSON.stringify(sessionData, null, 2));
    sessionsCache.set(sessionId, sessionData);
  } catch (error) {
    console.error('[saveSession] Failed to save session:', error);
    sessionsCache.set(sessionId, { user, expiresAt });
  }
}

async function loadSession(sessionId: string): Promise<{ user: SessionUser; expiresAt: number } | null> {
  try {
    // Try cache first
    const cached = sessionsCache.get(sessionId);
    if (cached) return cached;

    // Try Blob storage if enabled
    if (isBlobStorageEnabled()) {
      const data = await retrieveBlobData(`session:${sessionId}`);
      if (data) {
        const session = data as { user: SessionUser; expiresAt: number };
        sessionsCache.set(sessionId, session);
        return session;
      }
      return null;
    }

    // Try file system
    const sessionFile = path.join(SESSIONS_DIR, `${sessionId}.json`);
    const data = await fs.readFile(sessionFile, 'utf-8');
    const session = JSON.parse(data);
    sessionsCache.set(sessionId, session);
    return session;
  } catch {
    return null;
  }
}

async function deleteSessionFile(sessionId: string) {
  try {
    // Delete from Blob storage if enabled
    if (isBlobStorageEnabled()) {
      await deleteBlobData(`session:${sessionId}`);
      sessionsCache.delete(sessionId);
      return;
    }

    // Delete from file system
    const sessionFile = path.join(SESSIONS_DIR, `${sessionId}.json`);
    await fs.unlink(sessionFile);
    sessionsCache.delete(sessionId);
  } catch {
    sessionsCache.delete(sessionId);
  }
}

export async function createSession(user: SessionUser): Promise<string> {
  const sessionId = uuidv4();
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  await saveSession(sessionId, user, expiresAt);
  console.log('[createSession] Created session:', sessionId, 'for user:', user.email);
  return sessionId;
}

export async function getSession(sessionId: string): Promise<SessionUser | null> {
  const entry = await loadSession(sessionId);
  console.log('[getSession] Checking session:', sessionId, 'found:', !!entry);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    console.log('[getSession] Session expired:', sessionId);
    await deleteSessionFile(sessionId);
    return null;
  }
  console.log('[getSession] Returning user:', entry.user.email);
  return entry.user;
}

export async function destroySession(sessionId: string): Promise<void> {
  await deleteSessionFile(sessionId);
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
  console.log('[getCurrentUser] sessionId from cookie:', sessionId);
  if (!sessionId) {
    console.log('[getCurrentUser] No sessionId found in cookie');
    return null;
  }
  const user = await getSession(sessionId);
  console.log('[getCurrentUser] Session found:', !!user, 'user:', user?.email);
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

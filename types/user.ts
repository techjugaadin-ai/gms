export type UserRole = 'SUPER_ADMIN' | 'GYM_OWNER';

export interface User {
  id: string;
  gymId: string | null; // null for SUPER_ADMIN
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  id: string;
  gymId: string | null;
  name: string;
  email: string;
  role: UserRole;
}

import { v4 as uuidv4 } from 'uuid';

export function generateId(prefix: string): string {
  return `${prefix}_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
}

export function generateMemberId(gymPrefix: string, sequenceNumber: number): string {
  const seq = String(sequenceNumber).padStart(6, '0');
  return `${gymPrefix}-M${seq}`;
}

export function generateReferralCode(name: string): string {
  const base = name.replace(/\s+/g, '').toUpperCase().slice(0, 5);
  const suffix = Math.floor(10 + Math.random() * 90);
  return `${base}${suffix}`;
}

import type { MembershipStatus } from '@/types/member';

export function getMembershipStatus(membershipEndDate: string): MembershipStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(membershipEndDate);
  end.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'EXPIRED';
  if (diffDays <= 7) return 'EXPIRING_SOON';
  return 'ACTIVE';
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isToday(dateString: string): boolean {
  const today = new Date();
  const date = new Date(dateString);
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function isInCurrentMonth(dateString: string): boolean {
  const today = new Date();
  const date = new Date(dateString);
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
}

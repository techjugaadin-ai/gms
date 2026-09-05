import type { MembershipStatus } from '@/types/member';

const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30

/**
 * Get current date/time in Indian Standard Time (IST)
 */
export function getISTDate(date?: Date): Date {
  const d = date ? new Date(date) : new Date();
  const istTime = new Date(d.getTime() + (d.getTimezoneOffset() * 60 * 1000) + IST_OFFSET);
  return istTime;
}

/**
 * Get today's date at midnight in IST
 */
export function getTodayIST(): Date {
  const today = getISTDate();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Convert a date string or Date to IST and return at midnight
 */
export function getDateAtMidnightIST(dateInput: string | Date): Date {
  const d = typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
    ? new Date(`${dateInput}T00:00:00Z`)
    : typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  const istDate = getISTDate(d);
  istDate.setHours(0, 0, 0, 0);
  return istDate;
}

export function getMembershipStatus(membershipEndDate: string): MembershipStatus {
  const today = getTodayIST();
  const end = getDateAtMidnightIST(membershipEndDate);
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
  const d = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(`${date}T00:00:00Z`)
    : typeof date === 'string' ? new Date(date) : date;
  
  const istDate = getISTDate(d);
  return `${String(istDate.getDate()).padStart(2, '0')}/${String(istDate.getMonth() + 1).padStart(2, '0')}/${istDate.getFullYear()}`;
}

export function toISODateString(date: Date): string {
  const istDate = getISTDate(date);
  return `${istDate.getFullYear()}-${String(istDate.getMonth() + 1).padStart(2, '0')}-${String(istDate.getDate()).padStart(2, '0')}`;
}

export function isToday(dateString: string): boolean {
  const today = getTodayIST();
  const date = getDateAtMidnightIST(dateString);
  return date.getTime() === today.getTime();
}

export function isInCurrentMonth(dateString: string): boolean {
  const today = getTodayIST();
  const date = getDateAtMidnightIST(dateString);
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
}

/**
 * Get Monday of the current week in IST
 * If today is Monday, returns today
 */
export function getMondayOfCurrentWeek(): Date {
  const today = getTodayIST();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 6 = Saturday
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // How many days back to Monday
  const monday = new Date(today);
  monday.setDate(monday.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Get Sunday of the current week in IST
 * If today is Sunday, returns today
 */
export function getSundayOfCurrentWeek(): Date {
  const today = getTodayIST();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 6 = Saturday
  const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek; // How many days forward to Sunday
  const sunday = new Date(today);
  sunday.setDate(sunday.getDate() + daysToSunday);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

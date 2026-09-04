import { addMonths, toISODateString } from '@/lib/utils/date';

export function getTodayISODate(): string {
  return toISODateString(new Date());
}

export function calculateSubscriptionEndDate(startDate: string, durationMonths: number): string {
  return toISODateString(addMonths(new Date(`${startDate}T00:00:00`), durationMonths));
}

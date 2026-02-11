import { getLocalDateString, parseLocalDate } from '@/lib/utils';

/**
 * Returns the Sunday of the week containing the given date as YYYY-MM-DD.
 */
export function getWeekStartDate(date = new Date()): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // Roll back to Sunday
  return getLocalDateString(d);
}

/**
 * Returns an array of 7 date strings (Sun-Sat) for the given week start.
 */
export function getWeekDates(weekStart: string): string[] {
  const start = parseLocalDate(weekStart);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return getLocalDateString(d);
  });
}

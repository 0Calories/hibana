import { getLocalDateString, parseLocalDate } from '@/lib/utils';

/**
 * Format a duration in minutes using localized hour/minute suffixes.
 */
export function formatMinutes(
  mins: number,
  t: { hours: string; minutes: string },
) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}${t.hours} ${m}${t.minutes}`;
  if (h > 0) return `${h}${t.hours}`;
  return `${m}${t.minutes}`;
}

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

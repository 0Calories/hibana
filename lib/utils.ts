import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidDateString(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;

  // Check it's a real date (e.g., not 2026-02-31)
  const parsed = new Date(date);
  return !Number.isNaN(parsed.getTime());
}

/**
 * Parse a YYYY-MM-DD string as local midnight (not UTC).
 */
export function parseLocalDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

export function getLocalDateString(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

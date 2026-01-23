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

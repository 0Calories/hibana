// Intl.DurationFormat is supported in all modern browsers and Node 22+
// but TS esnext lib doesn't include the types yet.
declare namespace Intl {
  class DurationFormat {
    constructor(
      locale?: string,
      options?: { style?: string; minutesDisplay?: string },
    );
    format(duration: Record<string, number>): string;
  }
}

/**
 * Format a duration as a digital clock display.
 *
 * formatTimer(65)              → "01:05"     (seconds → MM:SS)
 * formatTimer(3661)            → "1:01:01"   (seconds → H:MM:SS)
 * formatTimer(150, 'minutes')  → "2:30"      (minutes → H:MM)
 */
export function formatTimer(
  value: number,
  unit: 'seconds' | 'minutes' = 'seconds',
): string {
  const total = Math.max(0, Math.round(value));

  if (unit === 'minutes') {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${h}:${String(m).padStart(2, '0')}`;
  }

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Minutes → localized human-readable duration via Intl.DurationFormat.
 * formatDuration(150, 'en') → "2 hr, 30 min"
 * formatDuration(45, 'ja')  → "45 分"
 */
export function formatDuration(mins: number, locale = 'en'): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0 && m === 0) {
    return new Intl.DurationFormat(locale, {
      style: 'short',
      minutesDisplay: 'always',
    }).format({ minutes: 0 });
  }
  const duration: Record<string, number> = {};
  if (h > 0) duration.hours = h;
  if (m > 0) duration.minutes = m;
  return new Intl.DurationFormat(locale, { style: 'short' })
    .format(duration)
    .replace(/,/g, '');
}

/**
 * Parse "H:MM" or plain number (as hours) back to minutes.
 * parseBudgetClock("2:30")       → 150
 * parseBudgetClock("1.5")        → 90
 * parseBudgetClock("2:30", 120)  → 120 (clamped)
 */
export function parseBudgetClock(input: string, max?: number): number | null {
  let minutes: number | null = null;

  const colonMatch = input.match(/^(\d{1,2}):(\d{0,2})$/);
  if (colonMatch) {
    const h = Number.parseInt(colonMatch[1], 10);
    const m = Number.parseInt(colonMatch[2] || '0', 10);
    if (h >= 0 && h <= 12 && m >= 0 && m < 60) {
      minutes = h * 60 + m;
    }
  } else {
    const num = Number.parseFloat(input);
    if (!Number.isNaN(num) && num >= 0) {
      minutes = Math.round(num * 60);
    }
  }

  if (minutes === null) return null;
  return max != null ? Math.min(minutes, max) : minutes;
}

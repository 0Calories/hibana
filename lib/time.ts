/**
 * Seconds → digital clock display. Clamps to 0, rounds.
 * formatTimer(65)   → "01:05"
 * formatTimer(3661) → "1:01:01"
 */
export function formatTimer(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Minutes → human-readable localized duration.
 * formatDuration(150, { hours: 'hr', minutes: 'min' }) → "2hr 30min"
 * formatDuration(90, { hours: '時間', minutes: '分' })  → "1時間 30分"
 */
export function formatDuration(
  mins: number,
  labels: { hours: string; minutes: string },
): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}${labels.hours} ${m}${labels.minutes}`;
  if (h > 0) return `${h}${labels.hours}`;
  return `${m}${labels.minutes}`;
}

/**
 * Minutes → clock notation for editable budget inputs.
 * formatBudgetClock(150) → "2:30"
 */
export function formatBudgetClock(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
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

/**
 * Display helpers specific to the daily-intent flames flow.
 * All inputs are seconds — the canonical unit of the new fuel system.
 */

/**
 * Format a fuel balance.
 *
 * formatFuelBalance(14400) → "4:00"
 * formatFuelBalance(2700)  → "45m"
 * formatFuelBalance(480)   → "8m"
 * formatFuelBalance(0)     → "0m"
 *
 * Uses H:MM when the balance is at least 60 minutes; otherwise compact "Nm".
 */
export function formatFuelBalance(seconds: number): string {
  const mins = Math.floor(Math.max(0, seconds) / 60);
  if (mins < 60) {
    return `${mins}m`;
  }
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

/**
 * Format a "planned today" total (sum of target_seconds across the lineup).
 *
 * formatPlannedMinutes(3000) → "50m"
 * formatPlannedMinutes(9000) → "2h 30m"
 */
export function formatPlannedMinutes(seconds: number): string {
  const mins = Math.floor(Math.max(0, seconds) / 60);
  if (mins < 60) {
    return `${mins}m`;
  }
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Hardset max for the planning canvas sum bar. 12 hours in seconds. */
export const PLAN_SUM_BAR_MAX_SECONDS = 12 * 60 * 60;

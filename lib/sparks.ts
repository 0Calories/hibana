/** Minimum fuel % to earn the completion bonus */
export const COMPLETION_THRESHOLD = 0.9;
/** Overburn % still treated as "full completion" for messaging */
export const OVERBURN_GRACE = 1.1;

/**
 * Shared spark reward calculation — single source of truth for
 * both the frontend preview (SealSummaryModal) and the backend ledger
 * (creditSealReward server action).
 */
export function calculateSparks(
  elapsedSeconds: number,
  targetSeconds: number,
  level: number,
): number {
  const levelMultiplier = 1 + (level - 1) * 0.1;
  // Cap credited time at the target — overburn minutes earn no sparks
  const creditedSeconds =
    targetSeconds > 0 ? Math.min(elapsedSeconds, targetSeconds) : elapsedSeconds;
  const minutes = Math.floor(creditedSeconds / 60);
  const completionBonus =
    targetSeconds > 0 && elapsedSeconds >= targetSeconds * COMPLETION_THRESHOLD
      ? Math.floor((targetSeconds / 60) * 0.5)
      : 0;
  return Math.floor(minutes * 1 * levelMultiplier) + completionBonus;
}

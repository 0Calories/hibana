/**
 * Shared heat (XP) calculation — single source of truth for
 * both the frontend preview (CompletionSummaryModal) and the backend
 * (creditCompletionReward server action + SQL compute_level_from_heat).
 *
 * Level scaling: exponential 1.5x
 *   heat_needed(n) = 200 * (1.5^(n-1) - 1)
 *   level_from_heat = 1 + floor(ln(heat/200 + 1) / ln(1.5))
 */

const LN_1_5 = Math.log(1.5);

export function calculateHeat(elapsedSeconds: number, level: number): number {
  const levelMultiplier = 1 + (level - 1) * 0.1;
  const minutes = Math.floor(elapsedSeconds / 60);
  return Math.floor(minutes * 1.5 * levelMultiplier);
}

export function computeLevelFromHeat(heat: number): number {
  if (heat <= 0) return 1;
  return Math.max(1, 1 + Math.floor(Math.log(heat / 200 + 1) / LN_1_5));
}

export function heatRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.ceil(200 * (1.5 ** (level - 1) - 1));
}

export interface HeatProgress {
  level: number;
  current: number;
  required: number;
}

export function heatProgress(totalHeat: number): HeatProgress {
  const level = computeLevelFromHeat(totalHeat);
  const heatAtCurrentLevel = heatRequiredForLevel(level);
  const heatAtNextLevel = heatRequiredForLevel(level + 1);
  return {
    level,
    current: totalHeat - heatAtCurrentLevel,
    required: heatAtNextLevel - heatAtCurrentLevel,
  };
}

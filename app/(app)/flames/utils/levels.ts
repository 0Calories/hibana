export interface FlameLevel {
  level: number;
  name: string;
  description: string;
}

export const FLAME_LEVELS: FlameLevel[] = [
  { level: 1, name: 'Ember', description: 'A tiny spark, just beginning' },
  { level: 2, name: 'Candle', description: 'A steady, focused flame' },
  { level: 3, name: 'Torch', description: 'Bold and unwavering' },
  { level: 4, name: 'Bonfire', description: 'Warmth that draws others in' },
  { level: 5, name: 'Blaze', description: 'Fierce and unstoppable' },
  { level: 6, name: 'Inferno', description: 'All-consuming passion' },
  { level: 7, name: 'Star', description: 'Transcendent brilliance' },
  { level: 8, name: 'Supernova', description: 'Legendary radiance' },
];

export function getFlameLevel(level: number): FlameLevel {
  const clamped = Math.max(1, Math.min(8, level));
  return FLAME_LEVELS[clamped - 1];
}

export interface FlameLevel {
  level: number;
  name: string;
  description: string;
  color: string;
}

export const FLAME_LEVELS: FlameLevel[] = [
  {
    level: 1,
    name: 'Wisp',
    description: 'A tiny flame, just beginning',
    color: '#6b7280',
  },
  {
    level: 2,
    name: 'Candle',
    description: 'A steady, focused flame',
    color: '#a8a29e',
  },
  {
    level: 3,
    name: 'Torch',
    description: 'A strong and reassuring flame',
    color: '#cd7f32',
  },
  {
    level: 4,
    name: 'Bonfire',
    description: 'Warmth that draws others in',
    color: '#b87333',
  },
  {
    level: 5,
    name: 'Blaze',
    description: 'Fierce and unstoppable',
    color: '#a9d4f5',
  },
  {
    level: 6,
    name: 'Inferno',
    description: 'All-consuming passion',
    color: '#d4af37',
  },
  {
    level: 7,
    name: 'Star',
    description: 'Transcendent brilliance',
    color: '#ffd700',
  },
  {
    level: 8,
    name: 'Supernova',
    description: 'Legendary radiance',
    color: '#ec4899',
  },
];

export function getFlameLevel(level: number): FlameLevel {
  const clamped = Math.max(1, Math.min(8, level));
  return FLAME_LEVELS[clamped - 1];
}

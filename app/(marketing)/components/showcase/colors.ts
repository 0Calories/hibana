export interface ShowcaseColors {
  light: string;
  medium: string;
  dark: string;
}

export interface ShowcaseLevel {
  level: number;
  name: string;
  colors: ShowcaseColors;
}

// Tailwind 400/500/600 hex values for the 8 flame tiers shown on the marketing
// page. Kept local to the marketing bundle so we don't pull from app/(app).
export const SHOWCASE_LEVELS: ShowcaseLevel[] = [
  {
    level: 1,
    name: 'Wisp',
    colors: { light: '#fda4af', medium: '#f43f5e', dark: '#e11d48' }, // rose
  },
  {
    level: 2,
    name: 'Candle',
    colors: { light: '#fdba74', medium: '#f97316', dark: '#ea580c' }, // orange
  },
  {
    level: 3,
    name: 'Torch',
    colors: { light: '#fcd34d', medium: '#f59e0b', dark: '#d97706' }, // amber
  },
  {
    level: 4,
    name: 'Bonfire',
    colors: { light: '#86efac', medium: '#22c55e', dark: '#16a34a' }, // green
  },
  {
    level: 5,
    name: 'Blaze',
    colors: { light: '#7dd3fc', medium: '#0ea5e9', dark: '#0284c7' }, // sky
  },
  {
    level: 6,
    name: 'Inferno',
    colors: { light: '#a5b4fc', medium: '#6366f1', dark: '#4f46e5' }, // indigo
  },
  {
    level: 7,
    name: 'Star',
    colors: { light: '#f0abfc', medium: '#d946ef', dark: '#c026d3' }, // fuchsia
  },
  {
    level: 8,
    name: 'Supernova',
    colors: { light: '#93c5fd', medium: '#3b82f6', dark: '#2563eb' }, // blue
  },
];

export const REVEALED_LEVEL_COUNT = 3;

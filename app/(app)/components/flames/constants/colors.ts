export type FlameColorName =
  | 'rose'
  | 'orange'
  | 'amber'
  | 'indigo'
  | 'teal'
  | 'green'
  | 'blue'
  | 'sky'
  | 'fuchsia';

// Colors picked from Tailwind color palette:
// https://tailwindcss.com/docs/colors
// Each family has shades: [400, 500, 600]

export const FLAME_BG_CLASSES: Record<FlameColorName, string> = {
  rose: 'bg-rose-500',
  orange: 'bg-orange-500',
  amber: 'bg-amber-500',
  indigo: 'bg-indigo-500',
  teal: 'bg-teal-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  sky: 'bg-sky-500',
  fuchsia: 'bg-fuchsia-500',
};

export const FLAME_GRADIENT_CLASSES: Record<FlameColorName, string> = {
  rose: 'bg-gradient-to-t from-rose-400 to-rose-600',
  orange: 'bg-gradient-to-t from-orange-300 to-orange-600',
  amber: 'bg-gradient-to-t from-amber-300 to-amber-600',
  indigo: 'bg-gradient-to-t from-indigo-300 to-indigo-600',
  teal: 'bg-gradient-to-t from-teal-300 to-teal-600',
  green: 'bg-gradient-to-t from-green-300 to-green-600',
  blue: 'bg-gradient-to-t from-blue-300 to-blue-600',
  sky: 'bg-gradient-to-t from-sky-300 to-sky-600',
  fuchsia: 'bg-gradient-to-t from-fuchsia-300 to-fuchsia-600',
};

// Earthly flames: warm fire colors (ordered hot → cool)
export const EARTHLY_FLAMES: FlameColorName[] = ['rose', 'orange', 'amber'];
// Chemical flames: nature/elemental colors (ordered hot → cool)
export const CHEMICAL_FLAMES: FlameColorName[] = ['indigo', 'teal', 'green'];
// Cosmic flames: mystical/space colors (ordered hot → cool)
export const COSMIC_FLAMES: FlameColorName[] = ['blue', 'sky', 'fuchsia'];

// Hex colors for SVG fills and glow effects
export const FLAME_HEX_COLORS: Record<
  FlameColorName,
  { light: string; medium: string; dark: string }
> = {
  rose: { light: '#fda4af', medium: '#f43f5e', dark: '#e11d48' },
  orange: { light: '#fdba74', medium: '#f97316', dark: '#ea580c' },
  amber: { light: '#fcd34d', medium: '#f59e0b', dark: '#d97706' },
  indigo: { light: '#a5b4fc', medium: '#6366f1', dark: '#4f46e5' },
  teal: { light: '#5eead4', medium: '#14b8a6', dark: '#0d9488' },
  green: { light: '#86efac', medium: '#22c55e', dark: '#16a34a' },
  blue: { light: '#93c5fd', medium: '#3b82f6', dark: '#2563eb' },
  sky: { light: '#7dd3fc', medium: '#0ea5e9', dark: '#0284c7' },
  fuchsia: { light: '#f0abfc', medium: '#d946ef', dark: '#c026d3' },
};

export function getFlameColors(colorName: FlameColorName | string | null) {
  const name = (colorName ?? 'orange') as FlameColorName;
  return FLAME_HEX_COLORS[name] ?? FLAME_HEX_COLORS.orange;
}

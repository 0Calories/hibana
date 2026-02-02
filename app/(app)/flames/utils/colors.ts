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
  rose: 'bg-gradient-to-br from-rose-400 to-rose-600',
  orange: 'bg-gradient-to-br from-orange-400 to-orange-600',
  amber: 'bg-gradient-to-br from-amber-400 to-amber-600',
  indigo: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
  teal: 'bg-gradient-to-br from-teal-400 to-teal-600',
  green: 'bg-gradient-to-br from-green-400 to-green-600',
  blue: 'bg-gradient-to-br from-blue-400 to-blue-600',
  sky: 'bg-gradient-to-br from-sky-400 to-sky-600',
  fuchsia: 'bg-gradient-to-br from-fuchsia-400 to-fuchsia-600',
};

// Earthly flames: warm fire colors (ordered hot → cool)
export const EARTHLY_FLAMES: FlameColorName[] = ['rose', 'orange', 'amber'];
// Chemical flames: nature/elemental colors (ordered hot → cool)
export const CHEMICAL_FLAMES: FlameColorName[] = ['indigo', 'teal', 'green'];
// Cosmic flames: mystical/space colors (ordered hot → cool)
export const COSMIC_FLAMES: FlameColorName[] = ['blue', 'sky', 'fuchsia'];

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

export type FlameColor = {
  name: FlameColorName;
  shades: string[];
};

// Colors picked from Tailwind color palette:
// https://tailwindcss.com/docs/colors
// Each family has shades: [400, 500, 600]

type FlameShade = '400' | '500' | '600';

export const getFlameColorClass = (
  name: FlameColorName,
  shade: FlameShade = '500',
) => {
  return `${name}-${shade}`;
};

// Earthly flames: warm fire colors (ordered hot → cool)
export const EARTHLY_FLAMES: FlameColor[] = [
  { name: 'rose', shades: ['400', '500', '600'] },
  { name: 'orange', shades: ['400', '500', '600'] },
  { name: 'amber', shades: ['400', '500', '600'] },
];

// Chemical flames: nature/elemental colors (ordered hot → cool)
export const CHEMICAL_FLAMES: FlameColor[] = [
  { name: 'indigo', shades: ['400', '500', '600'] },
  { name: 'teal', shades: ['400', '500', '600'] },
  { name: 'green', shades: ['400', '500', '600'] },
];

// Cosmic flames: mystical/space colors (ordered hot → cool)
export const COSMIC_FLAMES: FlameColor[] = [
  { name: 'blue', shades: ['400', '500', '600'] },
  { name: 'sky', shades: ['400', '500', '600'] },
  { name: 'fuchsia', shades: ['400', '500', '600'] },
];

export const FLAME_GRADIENT_CLASSES: Record<FlameColorName, string> = {
  rose: 'bg-gradient-to-r from-rose-500 to-rose-700',
  orange: 'bg-gradient-to-r from-orange-500 to-orange-700',
  amber: 'bg-gradient-to-r from-amber-500 to-amber-700',
  indigo: 'bg-gradient-to-r from-indigo-500 to-indigo-700',
  teal: 'bg-gradient-to-r from-teal-500 to-teal-700',
  green: 'bg-gradient-to-r from-green-500 to-green-700',
  blue: 'bg-gradient-to-r from-blue-500 to-blue-700',
  sky: 'bg-gradient-to-r from-sky-500 to-sky-700',
  fuchsia: 'bg-gradient-to-r from-fuchsia-500 to-fuchsia-700',
};

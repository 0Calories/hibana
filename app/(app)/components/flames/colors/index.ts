export const FlameColorIdentifiers = [
  'rose',
  'orange',
  'amber',
  'indigo',
  'teal',
  'green',
  'blue',
  'sky',
  'fuchsia',
] as const;

export type FlameColor = (typeof FlameColorIdentifiers)[number];
type FlameColorPalette = { light: string; medium: string; dark: string };

const FLAME_COLOR_PALETTE: Record<FlameColor, FlameColorPalette> = {
  rose: {
    light: 'oklch(0.81 0.117 11.638)',
    medium: 'oklch(0.645 0.246 16.439)',
    dark: 'oklch(0.586 0.253 17.585)',
  },
  orange: {
    light: 'oklch(0.837 0.128 66.29)',
    medium: 'oklch(0.705 0.213 47.604)',
    dark: 'oklch(0.646 0.222 41.116)',
  },
  amber: {
    light: 'oklch(0.879 0.169 91.605)',
    medium: 'oklch(0.769 0.188 70.08)',
    dark: 'oklch(0.666 0.179 58.318)',
  },
  indigo: {
    light: 'oklch(0.785 0.115 274.713)',
    medium: 'oklch(0.585 0.233 277.117)',
    dark: 'oklch(0.511 0.262 276.966)',
  },
  teal: {
    light: 'oklch(0.777 0.152 181.912)',
    medium: 'oklch(0.704 0.14 182.503)',
    dark: 'oklch(0.6 0.118 184.704)',
  },
  green: {
    light: 'oklch(0.792 0.209 151.711)',
    medium: 'oklch(0.723 0.219 149.579)',
    dark: 'oklch(0.627 0.194 149.214)',
  },
  blue: {
    light: 'oklch(0.809 0.105 251.813)',
    medium: 'oklch(0.623 0.214 259.815)',
    dark: 'oklch(0.546 0.245 262.881)',
  },
  sky: {
    light: 'oklch(0.828 0.111 230.318)',
    medium: 'oklch(0.685 0.169 237.323)',
    dark: 'oklch(0.588 0.158 241.966)',
  },
  fuchsia: {
    light: 'oklch(0.833 0.145 321.434)',
    medium: 'oklch(0.667 0.295 322.15)',
    dark: 'oklch(0.591 0.293 322.896)',
  },
};

export function getFlameColorPalette(identifier: FlameColor) {
  return FLAME_COLOR_PALETTE[identifier] ?? FLAME_COLOR_PALETTE.orange;
}

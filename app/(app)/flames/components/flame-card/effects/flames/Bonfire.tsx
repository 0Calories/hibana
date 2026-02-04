import type { FlameComponentProps, FlameDefinition } from '../types';

function BonfireBase() {
  return (
    <>
      <ellipse cx="50" cy="88" rx="35" ry="8" fill="#3E2723" opacity={0.5} />
      <rect
        x="15"
        y="78"
        width="32"
        height="8"
        rx="4"
        fill="#5D4037"
        transform="rotate(-15 31 82)"
      />
      <rect
        x="53"
        y="78"
        width="32"
        height="8"
        rx="4"
        fill="#4E342E"
        transform="rotate(15 69 82)"
      />
      <rect
        x="28"
        y="72"
        width="28"
        height="7"
        rx="3.5"
        fill="#6D4C41"
        transform="rotate(-8 42 75)"
      />
      <rect
        x="44"
        y="72"
        width="28"
        height="7"
        rx="3.5"
        fill="#5D4037"
        transform="rotate(8 58 75)"
      />
      <rect x="38" y="68" width="24" height="6" rx="3" fill="#4E342E" />
    </>
  );
}

function BonfireFlame({ colors }: FlameComponentProps) {
  return (
    <>
      <polygon
        points="25,30 38,60 32,72 12,72 8,55"
        fill={colors.dark}
        opacity={0.7}
      />
      <polygon
        points="75,25 88,55 92,72 68,72 62,60"
        fill={colors.dark}
        opacity={0.7}
      />
      <polygon
        points="50,5 78,55 70,72 30,72 22,55"
        fill={colors.dark}
        opacity={0.85}
      />
      <polygon
        points="50,18 70,52 64,68 36,68 30,52"
        fill={colors.medium}
        opacity={0.9}
      />
      <polygon points="50,30 60,48 56,62 44,62 40,48" fill={colors.light} />
    </>
  );
}

export const Bonfire: FlameDefinition = {
  Base: BonfireBase,
  Flame: BonfireFlame,
};

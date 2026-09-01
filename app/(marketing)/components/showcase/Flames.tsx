import type { ShowcaseColors } from './colors';

interface FlameProps {
  colors: ShowcaseColors;
}

export function WispFlame({ colors }: FlameProps) {
  return (
    <>
      <circle cx="50" cy="60" r="20" fill={colors.dark} opacity={0.5} />
      <circle cx="50" cy="60" r="14" fill={colors.medium} opacity={0.7} />
      <circle cx="50" cy="60" r="8" fill={colors.light} />
      <circle cx="50" cy="60" r="4" fill="white" opacity={0.8} />
    </>
  );
}

export function CandleFlame({ colors }: FlameProps) {
  return (
    <>
      {/* Candle body */}
      <rect x="44" y="70" width="12" height="25" fill="#8B7355" rx="1" />
      <rect x="42" y="68" width="16" height="4" fill="#A08060" rx="1" />
      <ellipse cx="50" cy="95" rx="14" ry="4" fill="#6B5344" />
      <rect x="49" y="62" width="2" height="10" fill="#333" />
      {/* Flame */}
      <polygon
        points="50,15 65,55 58,68 42,68 35,55"
        fill={colors.dark}
        opacity={0.8}
      />
      <polygon
        points="50,25 60,52 55,63 45,63 40,52"
        fill={colors.medium}
        opacity={0.9}
      />
      <polygon points="50,35 55,50 52,60 48,60 45,50" fill={colors.light} />
    </>
  );
}

export function TorchFlame({ colors }: FlameProps) {
  return (
    <>
      {/* Torch handle */}
      <polygon points="42,65 58,65 54,98 46,98" fill="#5D4037" />
      <polygon points="44,65 56,65 53,98 47,98" fill="#6D4C41" />
      <ellipse cx="50" cy="65" rx="12" ry="5" fill="#4E342E" />
      <ellipse cx="50" cy="63" rx="10" ry="4" fill="#3E2723" />
      {/* Flame */}
      <polygon
        points="50,5 75,50 65,65 35,65 25,50"
        fill={colors.dark}
        opacity={0.8}
      />
      <polygon
        points="50,15 68,48 60,60 40,60 32,48"
        fill={colors.medium}
        opacity={0.9}
      />
      <polygon points="50,25 58,45 54,55 46,55 42,45" fill={colors.light} />
    </>
  );
}

const FLAME_BY_LEVEL: Record<number, (props: FlameProps) => React.ReactNode> = {
  1: WispFlame,
  2: CandleFlame,
  3: TorchFlame,
};

export function ShowcaseFlame({
  level,
  colors,
  className,
}: {
  level: number;
  colors: ShowcaseColors;
  className?: string;
}) {
  const Component = FLAME_BY_LEVEL[level];
  if (!Component) return null;
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      role="img"
    >
      <Component colors={colors} />
    </svg>
  );
}

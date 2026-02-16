import type { ShapeColors } from './flame-card/effects/types';
import { FLAME_REGISTRY } from './flame-card/flames';

interface StaticFlameIconProps {
  level: number;
  colors: ShapeColors;
  className?: string;
}

export function StaticFlameIcon({
  level,
  colors,
  className = 'size-6',
}: StaticFlameIconProps) {
  const clampedLevel = Math.max(1, Math.min(8, level));
  const { Base, Flame } = FLAME_REGISTRY[clampedLevel];

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-hidden="true"
    >
      {Base && <Base />}
      <Flame colors={colors} />
    </svg>
  );
}

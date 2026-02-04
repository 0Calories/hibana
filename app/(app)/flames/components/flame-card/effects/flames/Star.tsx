import type { FlameComponentProps, FlameDefinition } from '../types';

function StarBase() {
  return null;
}

function StarFlame({ colors }: FlameComponentProps) {
  return (
    <>
      <circle cx="50" cy="50" r="45" fill={colors.dark} opacity={0.25} />
      <circle cx="50" cy="50" r="38" fill={colors.dark} opacity={0.35} />
      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x2 = 50 + Math.cos(rad) * 44;
        const y2 = 50 + Math.sin(rad) * 44;
        return (
          <polygon
            key={angle}
            points={`50,50 ${50 + Math.cos(rad - 0.15) * 30},${50 + Math.sin(rad - 0.15) * 30} ${x2},${y2} ${50 + Math.cos(rad + 0.15) * 30},${50 + Math.sin(rad + 0.15) * 30}`}
            fill={colors.medium}
            opacity={0.7}
          />
        );
      })}
      <circle cx="50" cy="50" r="28" fill={colors.dark} opacity={0.9} />
      <circle cx="50" cy="50" r="22" fill={colors.medium} />
      <circle cx="50" cy="50" r="15" fill={colors.light} />
      <circle cx="50" cy="50" r="8" fill="white" opacity={0.9} />
      <circle cx="45" cy="45" r="3" fill="white" opacity={0.5} />
    </>
  );
}

export const Star: FlameDefinition = {
  Base: StarBase,
  Flame: StarFlame,
  isCelestial: true,
};

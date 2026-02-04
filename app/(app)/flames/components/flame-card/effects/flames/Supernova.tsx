import type { FlameComponentProps, FlameDefinition } from '../types';

function SupernovaBase() {
  return null;
}

function SupernovaFlame({ colors }: FlameComponentProps) {
  return (
    <>
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="none"
        stroke={colors.dark}
        strokeWidth="3"
        opacity={0.3}
      />
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke={colors.medium}
        strokeWidth="2"
        opacity={0.4}
      />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const length = angle % 60 === 0 ? 46 : 38;
        const x1 = 50 + Math.cos(rad) * 12;
        const y1 = 50 + Math.sin(rad) * 12;
        const x2 = 50 + Math.cos(rad) * length;
        const y2 = 50 + Math.sin(rad) * length;
        return (
          <line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={angle % 60 === 0 ? colors.light : colors.medium}
            strokeWidth={angle % 60 === 0 ? 4 : 2}
            opacity={0.8}
          />
        );
      })}
      <circle cx="50" cy="50" r="22" fill={colors.dark} />
      <circle cx="50" cy="50" r="16" fill={colors.medium} />
      <circle cx="50" cy="50" r="10" fill={colors.light} />
      <circle cx="50" cy="50" r="5" fill="white" />
    </>
  );
}

export const Supernova: FlameDefinition = {
  Base: SupernovaBase,
  Flame: SupernovaFlame,
  isCelestial: true,
};

import type { FlameComponentProps, FlameDefinition } from '../types';

function WispFlame({ colors }: FlameComponentProps) {
  return (
    <>
      <circle cx="50" cy="60" r="20" fill={colors.dark} opacity={0.5} />
      <circle cx="50" cy="60" r="14" fill={colors.medium} opacity={0.7} />
      <circle cx="50" cy="60" r="8" fill={colors.light} />
      <circle cx="50" cy="60" r="4" fill="white" opacity={0.8} />
    </>
  );
}

export const Wisp: FlameDefinition = {
  Flame: WispFlame,
};

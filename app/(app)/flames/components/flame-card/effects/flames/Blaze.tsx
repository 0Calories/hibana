import type { FlameComponentProps, FlameDefinition } from '../types';

function BlazeBase() {
  return null;
}

function BlazeFlame({ colors }: FlameComponentProps) {
  return (
    <>
      <polygon
        points="15,20 28,45 22,95 5,95 2,50"
        fill={colors.dark}
        opacity={0.6}
      />
      <polygon
        points="85,15 98,50 95,95 78,95 72,45"
        fill={colors.dark}
        opacity={0.6}
      />
      <polygon
        points="30,10 45,40 40,95 20,95 15,50"
        fill={colors.dark}
        opacity={0.7}
      />
      <polygon
        points="70,8 85,45 80,95 60,95 55,40"
        fill={colors.dark}
        opacity={0.7}
      />
      <polygon
        points="50,2 80,50 72,95 28,95 20,50"
        fill={colors.medium}
        opacity={0.9}
      />
      <polygon
        points="50,18 68,48 62,85 38,85 32,48"
        fill={colors.light}
        opacity={0.95}
      />
      <polygon
        points="50,32 58,50 54,75 46,75 42,50"
        fill="white"
        opacity={0.6}
      />
    </>
  );
}

export const Blaze: FlameDefinition = {
  Base: BlazeBase,
  Flame: BlazeFlame,
};

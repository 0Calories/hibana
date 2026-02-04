import type { FlameComponentProps, FlameDefinition } from '../types';

function TorchBase() {
  return (
    <>
      <polygon points="42,65 58,65 54,98 46,98" fill="#5D4037" />
      <polygon points="44,65 56,65 53,98 47,98" fill="#6D4C41" />
      <ellipse cx="50" cy="65" rx="12" ry="5" fill="#4E342E" />
      <ellipse cx="50" cy="63" rx="10" ry="4" fill="#3E2723" />
    </>
  );
}

function TorchFlame({ colors }: FlameComponentProps) {
  return (
    <>
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

export const Torch: FlameDefinition = {
  Base: TorchBase,
  Flame: TorchFlame,
};

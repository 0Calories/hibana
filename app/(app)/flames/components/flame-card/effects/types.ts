import type { FlameState } from '../../hooks/useFlameTimer';

export interface ShapeColors {
  light: string;
  medium: string;
  dark: string;
}

export interface FlameComponentProps {
  colors: ShapeColors;
}

export interface FlameParticlesProps {
  state: FlameState;
  colors: ShapeColors;
}

export interface FlameDefinition {
  Base: React.FC;
  Flame: React.FC<FlameComponentProps>;
  Particles?: React.FC<FlameParticlesProps>;
  /** Whether this flame type uses radiate animation instead of flicker */
  isCelestial?: boolean;
}

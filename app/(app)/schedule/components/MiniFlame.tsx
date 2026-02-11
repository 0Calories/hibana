'use client';

import { FlameRenderer } from '@/app/(app)/flames/components/flame-card/effects/FlameRenderer';
import { getFlameColors } from '@/app/(app)/flames/utils/colors';

interface MiniFlameProps {
  color: string | null;
}

export function MiniFlame({ color }: MiniFlameProps) {
  const colors = getFlameColors(color);

  return (
    <FlameRenderer
      state="untended"
      level={1}
      colors={colors}
      className="h-6 w-5"
    />
  );
}

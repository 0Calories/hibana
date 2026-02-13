'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  CHEMICAL_FLAMES,
  COSMIC_FLAMES,
  EARTHLY_FLAMES,
  FLAME_BG_CLASSES,
  type FlameColorName,
} from '../utils/colors';

const FLAME_COLOR_GRID = [
  [EARTHLY_FLAMES[0], EARTHLY_FLAMES[1], EARTHLY_FLAMES[2]],
  [COSMIC_FLAMES[0], COSMIC_FLAMES[1], COSMIC_FLAMES[2]],
  [CHEMICAL_FLAMES[0], CHEMICAL_FLAMES[1], CHEMICAL_FLAMES[2]],
];

const ALL_COLORS = [...EARTHLY_FLAMES, ...COSMIC_FLAMES, ...CHEMICAL_FLAMES];

interface ColorPickerGridProps {
  value: FlameColorName;
  onChange: (color: FlameColorName) => void;
  variant?: 'grid' | 'strip';
}

export function ColorPickerGrid({
  value = 'rose',
  onChange,
  variant = 'grid',
}: ColorPickerGridProps) {
  if (variant === 'strip') {
    return (
      <div className="flex gap-2 justify-center">
        {ALL_COLORS.map((color) => (
          <Button
            key={color}
            type="button"
            className={cn(
              'size-7 rounded-full transition-transform hover:scale-110 cursor-pointer',
              FLAME_BG_CLASSES[color],
              value === color && 'ring-1 ring-foreground',
            )}
            onClick={() => onChange(color)}
            aria-label={`Select ${color}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1.5">
        {FLAME_COLOR_GRID.map((row) =>
          row.map((color) => {
            return (
              <Button
                key={color}
                type="button"
                className={cn(
                  'size-7 rounded-md transition-transform hover:scale-110 cursor-pointer',
                  FLAME_BG_CLASSES[color],
                  value === color && 'ring-1 ring-foreground',
                )}
                onClick={() => onChange(color)}
                aria-label={`Select ${color}`}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}

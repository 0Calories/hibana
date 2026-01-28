'use client';

import { cn } from '@/lib/utils';
import { Button } from '../../../../components/ui/button';
import {
  CHEMICAL_FLAMES,
  COSMIC_FLAMES,
  EARTHLY_FLAMES,
  type FlameColorName,
  getFlameColorClass,
} from '../utils/colors';

const COLOR_GRID = [
  [COSMIC_FLAMES[0], COSMIC_FLAMES[1], COSMIC_FLAMES[2]],
  [CHEMICAL_FLAMES[0], CHEMICAL_FLAMES[1], CHEMICAL_FLAMES[2]],
  [EARTHLY_FLAMES[0], EARTHLY_FLAMES[1], EARTHLY_FLAMES[2]],
];

interface ColorPickerGridProps {
  value: FlameColorName;
  onChange: (color: FlameColorName) => void;
}

export function ColorPickerGrid({
  value = 'rose',
  onChange,
}: ColorPickerGridProps) {
  const bgColorClass = `bg-${getFlameColorClass(value)}`;
  console.log(bgColorClass);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1.5">
        {COLOR_GRID.map((row) =>
          row.map((color) => {
            return (
              <Button
                key={color.name}
                type="button"
                className={cn(
                  'size-7 rounded-md transition-transform hover:scale-110',
                  bgColorClass,
                  value === color.name && 'ring-1 ring-foreground',
                )}
                onClick={() => onChange(color.name)}
                aria-label={`Select ${color.name}`}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}

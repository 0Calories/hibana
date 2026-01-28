'use client';

import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from './ui/button';

// Organized by color family: [400, 500, 600]
// Ordered for 3x3 grid: warm row, mixed row, cool row
const COLOR_FAMILIES = [
  // Warm
  { name: 'Rose', shades: ['#fb7185', '#f43f5e', '#e11d48'] },
  { name: 'Pink', shades: ['#f472b6', '#ec4899', '#db2777'] },
  { name: 'Orange', shades: ['#fb923c', '#f97316', '#ea580c'] },
  // Mixed
  { name: 'Fuchsia', shades: ['#e879f9', '#d946ef', '#c026d3'] },
  { name: 'Green', shades: ['#4ade80', '#22c55e', '#16a34a'] },
  { name: 'Teal', shades: ['#2dd4bf', '#14b8a6', '#0d9488'] },
  // Cool
  { name: 'Indigo', shades: ['#818cf8', '#6366f1', '#4f46e5'] },
  { name: 'Blue', shades: ['#60a5fa', '#3b82f6', '#2563eb'] },
  { name: 'Cyan', shades: ['#22d3ee', '#06b6d4', '#0891b2'] },
];

// Default colors: middle shade (500) from each family (index 1)
const DEFAULT_COLORS = COLOR_FAMILIES.map((family) => family.shades[1]);

// All colors for expanded view
const ALL_COLORS = COLOR_FAMILIES.flatMap((family) => family.shades);

interface ColorPickerGridProps {
  value?: string;
  onChange: (color: string) => void;
}

export function ColorPickerGrid({ value, onChange }: ColorPickerGridProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1.5">
        {expanded
          ? // Expanded: 9 rows × 3 cols (one row per color family, showing 400/500/600)
            COLOR_FAMILIES.map((family) =>
              family.shades.map((shade, shadeIndex) => (
                <button
                  key={shade}
                  type="button"
                  className={cn(
                    'size-7 rounded-md transition-transform hover:scale-110',
                    value === shade && 'ring-2 ring-offset-2 ring-foreground',
                  )}
                  style={{ backgroundColor: shade }}
                  onClick={() => onChange(shade)}
                  aria-label={`Select ${family.name} ${400 + shadeIndex * 100}`}
                />
              )),
            )
          : // Collapsed: 3x3 grid of default colors (500 shade)
            DEFAULT_COLORS.map((color, index) => (
              <button
                key={color}
                type="button"
                className={cn(
                  'size-7 rounded-md transition-transform hover:scale-110',
                  value === color && 'ring-2 ring-offset-2 ring-foreground',
                )}
                style={{ backgroundColor: color }}
                onClick={() => onChange(color)}
                aria-label={`Select ${COLOR_FAMILIES[index].name}`}
              />
            ))}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full text-xs text-muted-foreground"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <>
            <ChevronUpIcon className="size-3" />
            Less colors
          </>
        ) : (
          <>
            <ChevronDownIcon className="size-3" />
            More colors
          </>
        )}
      </Button>
    </div>
  );
}

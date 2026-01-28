'use client';

import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from './ui/button';

// Organized by color family: [400, 500, 600]
const COLOR_FAMILIES = [
  { name: 'Rose', shades: ['#fb7185', '#f43f5e', '#e11d48'] },
  { name: 'Pink', shades: ['#f472b6', '#ec4899', '#db2777'] },
  { name: 'Fuchsia', shades: ['#e879f9', '#d946ef', '#c026d3'] },
  { name: 'Orange', shades: ['#fb923c', '#f97316', '#ea580c'] },
  { name: 'Amber', shades: ['#fbbf24', '#f59e0b', '#d97706'] },
  { name: 'Green', shades: ['#4ade80', '#22c55e', '#16a34a'] },
  { name: 'Teal', shades: ['#2dd4bf', '#14b8a6', '#0d9488'] },
  { name: 'Cyan', shades: ['#22d3ee', '#06b6d4', '#0891b2'] },
  { name: 'Blue', shades: ['#60a5fa', '#3b82f6', '#2563eb'] },
  { name: 'Indigo', shades: ['#818cf8', '#6366f1', '#4f46e5'] },
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

  const colors = expanded ? ALL_COLORS : DEFAULT_COLORS;
  const gridCols = expanded ? 'grid-cols-10' : 'grid-cols-10';

  return (
    <div className="space-y-2">
      <div className={cn('grid gap-1.5', gridCols)}>
        {expanded
          ? // Expanded: show as 3 rows (400s, 500s, 600s)
            [0, 1, 2].map((shadeIndex) => (
              <div key={shadeIndex} className="contents">
                {COLOR_FAMILIES.map((family) => (
                  <button
                    key={family.shades[shadeIndex]}
                    type="button"
                    className={cn(
                      'size-7 rounded-md transition-transform hover:scale-110',
                      value === family.shades[shadeIndex] &&
                        'ring-2 ring-offset-2 ring-foreground',
                    )}
                    style={{ backgroundColor: family.shades[shadeIndex] }}
                    onClick={() => onChange(family.shades[shadeIndex])}
                    aria-label={`Select ${family.name} ${400 + shadeIndex * 100}`}
                  />
                ))}
              </div>
            ))
          : // Collapsed: single row of default colors
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

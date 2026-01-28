'use client';

import { cn } from '@/lib/utils';
import { Button } from './ui/button';

// Colors picked from Tailwind color palette:
// https://tailwindcss.com/docs/colors
// Each family has shades: [400, 500, 600]

// Earthly flames: warm fire colors (ordered hot → cool)
const EARTHLY = [
  { name: 'Rose', shades: ['#fb7185', '#f43f5e', '#e11d48'] },
  { name: 'Orange', shades: ['#fb923c', '#f97316', '#ea580c'] },
  { name: 'Amber', shades: ['#fbbf24', '#f59e0b', '#d97706'] },
];

// Chemical flames: nature/elemental colors (ordered hot → cool)
const CHEMICAL = [
  { name: 'Indigo', shades: ['#818cf8', '#6366f1', '#4f46e5'] },
  { name: 'Teal', shades: ['#2dd4bf', '#14b8a6', '#0d9488'] },
  { name: 'Green', shades: ['#4ade80', '#22c55e', '#16a34a'] },
];

// Cosmic flames: mystical/space colors (ordered hot → cool)
const COSMIC = [
  { name: 'Blue', shades: ['#60a5fa', '#3b82f6', '#2563eb'] },
  { name: 'Sky', shades: ['#38bdf8', '#0ea5e9', '#0284c7'] },
  { name: 'Fuchsia', shades: ['#e879f9', '#d946ef', '#c026d3'] },
];

const COLOR_GRID = [
  [COSMIC[0], COSMIC[1], COSMIC[2]],
  [CHEMICAL[0], CHEMICAL[1], CHEMICAL[2]],
  [EARTHLY[0], EARTHLY[1], EARTHLY[2]],
];

// Defaults to middle shade (500) from each family (index 1)
const COLOR_INDEX = 1;

interface ColorPickerGridProps {
  value?: string;
  onChange: (color: string) => void;
}

export function ColorPickerGrid({ value, onChange }: ColorPickerGridProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1.5">
        {COLOR_GRID.map((row) =>
          row.map((col) => {
            const color = col.shades[COLOR_INDEX];

            return (
              <Button
                key={color}
                type="button"
                className={cn(
                  'size-7 rounded-md transition-transform hover:scale-110',
                  value === color && 'ring-1 ring-foreground',
                )}
                style={{ backgroundColor: color }}
                onClick={() => onChange(color)}
                aria-label={`Select ${col.name}`}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}

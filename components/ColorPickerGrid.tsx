'use client';

import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from './ui/button';

// Colors picked from Tailwind color palette:
// https://tailwindcss.com/docs/colors

// Organized by color family: [400, 500, 600]
// Ordered for 3x3 grid: flame intensity theme
// Columns = flame types (Earthly, Chemical, Cosmic)
// Rows = heat intensity (hot → cool, top to bottom)

const COLOR_FAMILIES = [
  // Row 1: Hottest
  { name: 'Rose', shades: ['#fb7185', '#f43f5e', '#e11d48'] },
  { name: 'Cyan', shades: ['#22d3ee', '#06b6d4', '#0891b2'] },
  { name: 'Fuchsia', shades: ['#e879f9', '#d946ef', '#c026d3'] },
  // Row 2: Medium
  { name: 'Amber', shades: ['#fbbf24', '#f59e0b', '#d97706'] },
  { name: 'Teal', shades: ['#2dd4bf', '#14b8a6', '#0d9488'] },
  { name: 'Indigo', shades: ['#818cf8', '#6366f1', '#4f46e5'] },
  // Row 3: Coolest
  { name: 'Orange', shades: ['#fb923c', '#f97316', '#ea580c'] },
  { name: 'Green', shades: ['#4ade80', '#22c55e', '#16a34a'] },
  { name: 'Blue', shades: ['#60a5fa', '#3b82f6', '#2563eb'] },
];

// Default colors: middle shade (500) from each family (index 1)
const DEFAULT_COLORS = COLOR_FAMILIES.map((family) => family.shades[1]);

interface ColorPickerGridProps {
  value?: string;
  expandable?: boolean;
  onChange: (color: string) => void;
}

export function ColorPickerGrid({
  value,
  onChange,
  expandable,
}: ColorPickerGridProps) {
  const [expanded, setExpanded] = useState(false);

  const renderBaseGrid = () => {
    return DEFAULT_COLORS.map((color, index) => (
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
    ));
  };

  const renderExpandedGrid = () => {
    return COLOR_FAMILIES.map((family) =>
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
    );
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1.5">
        {expanded ? renderExpandedGrid() : renderBaseGrid()}
      </div>

      {expandable && (
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
      )}
    </div>
  );
}

import type { ComponentType } from 'react';
import { StickyNotePack } from './StickyNotePack';

interface ItemVisualProps {
  className?: string;
}

/**
 * Registry mapping item IDs (or names as fallback) to their SVG visual components.
 * Add new items here as they're created.
 */
const ITEM_VISUALS: Record<string, ComponentType<ItemVisualProps>> = {
  'Sticky Note Pack': StickyNotePack,
};

export function getItemVisual(
  itemName: string,
): ComponentType<ItemVisualProps> | null {
  return ITEM_VISUALS[itemName] ?? null;
}

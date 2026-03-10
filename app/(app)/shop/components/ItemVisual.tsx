'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { PackageIcon } from 'lucide-react';
import { getItemVisual } from './items';

interface ItemVisualProps {
  itemName: string;
}

/**
 * Renders an item's SVG visual with a subtle levitation animation.
 * Falls back to a generic icon if no visual is registered for the item.
 */
export function ItemVisual({ itemName }: ItemVisualProps) {
  const shouldReduceMotion = useReducedMotion();
  const Visual = getItemVisual(itemName);

  const content = Visual ? (
    <Visual className="h-full w-full" />
  ) : (
    <PackageIcon className="size-12 text-muted-foreground" />
  );

  if (shouldReduceMotion) {
    return <div className="flex items-center justify-center">{content}</div>;
  }

  return (
    <motion.div
      className="flex items-center justify-center"
      animate={{ y: [0, -4, 0] }}
      transition={{
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'easeInOut',
      }}
    >
      {content}
    </motion.div>
  );
}

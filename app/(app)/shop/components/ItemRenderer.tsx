import { PackageIcon } from 'lucide-react';
import { getItemVisual } from './items';

interface ItemRendererProps {
  itemName: string;
}

/**
 * Renders an item's SVG visual component.
 * Each visual handles its own animation internally.
 * Falls back to a generic icon if no visual is registered.
 */
export function ItemRenderer({ itemName }: ItemRendererProps) {
  const Visual = getItemVisual(itemName);

  if (!Visual) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <PackageIcon className="size-12 text-muted-foreground" />
      </div>
    );
  }

  return <Visual className="h-full w-full" />;
}

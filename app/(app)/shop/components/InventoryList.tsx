'use client';

import type { InventoryItemWithDetails } from '../actions';
import { InventoryItem } from './InventoryItem';

interface InventoryListProps {
  inventory: InventoryItemWithDetails[];
  setInventory: React.Dispatch<
    React.SetStateAction<InventoryItemWithDetails[]>
  >;
}

export function InventoryList({ inventory, setInventory }: InventoryListProps) {
  const handleEquipToggle = (inventoryId: string, equipped: boolean) => {
    setInventory((prev) =>
      prev.map((inv) =>
        inv.id === inventoryId ? { ...inv, is_equipped: equipped } : inv,
      ),
    );
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {inventory.map((inv) => (
        <InventoryItem
          key={inv.id}
          inventoryItem={inv}
          onEquipToggle={handleEquipToggle}
        />
      ))}
    </div>
  );
}

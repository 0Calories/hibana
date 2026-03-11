'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { InventoryItemWithDetails, ShopPageData } from '../actions';
import { ItemCard } from './ItemCard';

export function ShopContent({ data }: { data: ShopPageData }) {
  const t = useTranslations('shop');
  const [balance, setBalance] = useState(data.balance);
  const [inventory, setInventory] = useState<InventoryItemWithDetails[]>(
    data.inventory,
  );

  const handlePurchase = (itemId: string, cost: number) => {
    setBalance((b) => b - cost);

    // Optimistically update inventory
    const existing = inventory.find((inv) => inv.item_id === itemId);
    if (existing) {
      setInventory((prev) =>
        prev.map((inv) =>
          inv.item_id === itemId ? { ...inv, quantity: inv.quantity + 1 } : inv,
        ),
      );
    } else {
      const item = data.items.find((i) => i.id === itemId);
      if (item) {
        setInventory((prev) => [
          {
            id: crypto.randomUUID(),
            user_id: '',
            item_id: itemId,
            quantity: 1,
            is_equipped: false,
            acquired_at: new Date().toISOString(),
            items: item,
          },
          ...prev,
        ]);
      }
    }
  };

  const getOwnedQuantity = (itemId: string) => {
    return inventory.find((inv) => inv.item_id === itemId)?.quantity ?? 0;
  };

  return (
    <div className="size-full p-4 pb-24">
      {data.items.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          {t('emptyShop')}
        </p>
      ) : (
        <div className="mx-auto grid w-fit grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {data.items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              balance={balance}
              ownedQuantity={getOwnedQuantity(item.id)}
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      )}
    </div>
  );
}

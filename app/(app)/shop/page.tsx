import { getShopPageData } from './actions';
import { ShopContent } from './components/ShopContent';

export default async function ShopPage() {
  const result = await getShopPageData();

  if (!result.success) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Failed to load shop.
      </div>
    );
  }

  return <ShopContent data={result.data} />;
}

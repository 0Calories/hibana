import { getTranslations } from 'next-intl/server';
import {
  FlameCardSkeleton,
  FuelMeterSkeleton,
} from './components/flame-card/FlameCardSkeleton';

export default async function FlamesLoading() {
  const t = await getTranslations('flames');

  return (
    <div className="size-full p-4 pb-24">
      <FuelMeterSkeleton label={t('fuel.label')} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Loading skeleton
          <FlameCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

import { getTranslations } from 'next-intl/server';
import {
  FlameCardSkeleton,
  FuelMeterSkeleton,
} from './components/FlameCardSkeleton';

export default async function FlamesLoading() {
  const t = await getTranslations('flames');

  return (
    <div className="size-full p-4 pb-24">
      {/* Page title skeleton */}
      <div className="mb-6 h-8 w-32 animate-pulse rounded-lg bg-slate-200 dark:bg-white/10" />

      <FuelMeterSkeleton label={t('fuel.label')} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <FlameCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

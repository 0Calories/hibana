import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getFlamesPageData } from './actions';
import { FlamesList } from './components/FlamesList';
import { FlamesPageActions } from './components/FlamesPageActions';
import { getTodayDateString } from './utils/utils';

export default async function FlamesPage() {
  const t = await getTranslations('flames');
  const today = getTodayDateString();

  const result = await getFlamesPageData(today);

  // TODO: Handle error display, this is incorrectly showing a loading state
  if (!result.success) {
    return (
      <div className="size-full p-4 pb-24">
        <div className="flex justify-end mb-4">
          <FlamesPageActions />
        </div>
        <p>{t('loading')}</p>
      </div>
    );
  }

  const { flames, sessions, fuelBudget } = result.data;

  return (
    <div className="size-full p-4 pb-24">
      {flames.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <FlamesPageActions />
          <p className="text-muted-foreground text-sm">{t('emptyToday')}</p>
          <Link
            href="/flames/manage"
            className="text-sm font-medium text-primary hover:underline"
          >
            {t('emptyTodayAction')}
          </Link>
        </div>
      ) : (
        <FlamesList
          flames={flames}
          initialSessions={sessions}
          date={today}
          initialFuelBudget={fuelBudget}
        />
      )}
    </div>
  );
}

import { ChevronLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getWeeklySchedule } from './actions';
import { WeeklyPlanner } from './components/WeeklyPlanner';

export default async function SchedulePage() {
  const t = await getTranslations('schedule');

  const scheduleResult = await getWeeklySchedule();

  if (!scheduleResult.success) {
    return (
      <div className="size-full p-4 pb-24">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/flames"
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
            aria-label={t('backToFlames')}
          >
            <ChevronLeftIcon className="size-5" />
          </Link>
          <h1 className="text-lg font-semibold">{t('pageTitle')}</h1>
        </div>
        <p className="text-muted-foreground">{t('loadError')}</p>
      </div>
    );
  }

  return (
    <div className="size-full p-4 pb-24 sm:p-6 lg:p-8 lg:pb-24">
      <div className="flex items-center gap-2 mb-4">
        <Link
          href="/flames"
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
        >
          <ChevronLeftIcon className="size-5" />
        </Link>
        <h1 className="text-lg font-semibold">{t('pageTitle')}</h1>
      </div>
      <WeeklyPlanner initialSchedule={scheduleResult.data} />
    </div>
  );
}

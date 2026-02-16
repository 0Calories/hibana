import { ChevronLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { parseLocalDate } from '@/lib/utils';
import { getWeeklySchedule } from './actions';
import { WeeklyPlanner } from './components/WeeklyPlanner';
import { getWeekStartDate } from './utils';

function formatWeekRange(weekStart: string) {
  const start = parseLocalDate(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const fmt = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  });

  // If same month, show "Feb 8 – 14", otherwise "Feb 28 – Mar 6"
  if (start.getMonth() === end.getMonth()) {
    const startStr = fmt.format(start);
    return `${startStr} – ${end.getDate()}`;
  }

  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export default async function SchedulePage() {
  const t = await getTranslations('schedule');
  const weekStart = getWeekStartDate();

  const scheduleResult = await getWeeklySchedule(weekStart);

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

  const weekRange = formatWeekRange(weekStart);

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
        <span className="text-sm text-muted-foreground">{weekRange}</span>
      </div>
      <WeeklyPlanner
        initialSchedule={scheduleResult.data}
        weekStart={weekStart}
      />
    </div>
  );
}

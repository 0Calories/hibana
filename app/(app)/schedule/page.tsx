import { getTranslations } from 'next-intl/server';
import { getWeeklySchedule } from './actions';
import { WeeklyPlanner } from './components/WeeklyPlanner';
import { getWeekStartDate } from './utils';

export default async function SchedulePage() {
  const t = await getTranslations('schedule');
  const weekStart = getWeekStartDate();

  const scheduleResult = await getWeeklySchedule(weekStart);

  if (!scheduleResult.success) {
    return (
      <div className="size-full p-4 pb-24">
        <h1 className="mb-6 text-2xl font-bold">{t('pageTitle')}</h1>
        <p className="text-muted-foreground">Failed to load schedule.</p>
      </div>
    );
  }

  return (
    <div className="size-full p-4 pb-24">
      <h1 className="mb-6 text-2xl font-bold">{t('pageTitle')}</h1>
      <WeeklyPlanner
        initialSchedule={scheduleResult.data}
        weekStart={weekStart}
      />
    </div>
  );
}

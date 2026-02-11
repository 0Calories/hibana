import { CalendarRangeIcon } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getFlamesForDay } from './actions/flame-actions';
import { getRemainingFuelBudget } from './actions/fuel-actions';
import { FlamesList } from './components/FlamesList';
import { getAllSessionsForDate } from './session-actions';
import { getTodayDateString } from './utils/utils';

export default async function FlamesPage() {
  const t = await getTranslations('flames');
  const today = getTodayDateString();

  const [flamesResult, sessionsResult, fuelResult] = await Promise.all([
    getFlamesForDay(today),
    getAllSessionsForDate(today),
    getRemainingFuelBudget(today),
  ]);

  if (!flamesResult.data) {
    return (
      <div className="size-full p-4 pb-24">
        <h1 className="mb-6 text-2xl font-bold">{t('pageTitle')}</h1>
        <p>{t('loading')}</p>
      </div>
    );
  }

  const flames = flamesResult.data;
  const sessions = sessionsResult.success ? (sessionsResult.data ?? []) : [];
  const fuelBudget = fuelResult.success ? (fuelResult.data ?? null) : null;

  return (
    <div className="size-full p-4 pb-24">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('pageTitle')}</h1>
        <Link
          href="/schedule"
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-muted hover:text-slate-700"
        >
          <CalendarRangeIcon className="size-5" />
        </Link>
      </div>
      {flames.length === 0 ? (
        <p className="text-muted-foreground">{t('empty')}</p>
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

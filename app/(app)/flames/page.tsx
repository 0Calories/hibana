import { SettingsIcon } from 'lucide-react';
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">{t('todayTitle')}</h1>
          <Link
            href="/flames/manage"
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label={t('manageLink')}
          >
            <SettingsIcon className="size-5" />
          </Link>
        </div>
        <p>{t('loading')}</p>
      </div>
    );
  }

  const flames = flamesResult.data;
  const sessions = sessionsResult.success ? (sessionsResult.data ?? []) : [];
  const fuelBudget = fuelResult.success ? (fuelResult.data ?? null) : null;

  return (
    <div className="size-full p-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">{t('todayTitle')}</h1>
        <Link
          href="/flames/manage"
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label={t('manageLink')}
        >
          <SettingsIcon className="size-5" />
        </Link>
      </div>
      {flames.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
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

import { getTranslations } from 'next-intl/server';
import { FlamesList } from './components/FlamesList';
import { getFlamesForDay } from './flame-actions';
import { getRemainingFuelBudget } from './fuel-actions';
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
      <h1 className="mb-6 text-2xl font-bold">{t('pageTitle')}</h1>
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

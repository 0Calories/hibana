import { getTranslations } from 'next-intl/server';
import { getFlamesForDay } from './actions/flame-actions';
import { getRemainingFuelBudget } from './actions/fuel-actions';
import { AddFlameCard } from './components/AddFlameCard';
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
        <p>{t('loading')}</p>
      </div>
    );
  }

  const flames = flamesResult.data;
  const sessions = sessionsResult.success ? (sessionsResult.data ?? []) : [];
  const fuelBudget = fuelResult.success ? (fuelResult.data ?? null) : null;

  return (
    <div className="size-full p-4 pb-24">
      {flames.length === 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          <AddFlameCard />
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

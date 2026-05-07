import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getServerToday } from '@/lib/timezone';
import { getAllFlames, getDailyPlan, getLastUsedTargetsMap } from './actions';
import { FlamesList } from './components/FlamesList';
import { FlamesPageActions } from './components/FlamesPageActions';
import { PlanningCanvas } from './components/PlanningCanvas';

export default async function FlamesPage() {
  const t = await getTranslations('flames');
  const today = await getServerToday();

  const [planResult, flamesResult, lastUsedResult] = await Promise.all([
    getDailyPlan(today),
    getAllFlames(),
    getLastUsedTargetsMap(),
  ]);

  if (!planResult.success) {
    return (
      <div className="size-full p-4 pb-24">
        <div className="flex justify-end mb-4">
          <FlamesPageActions />
        </div>
        <p>{t('loading')}</p>
      </div>
    );
  }

  const { entries, fuelBalanceSeconds } = planResult.data;
  const allFlames = flamesResult.success ? flamesResult.data : [];
  const lastUsedTargetsByFlameId = lastUsedResult.success
    ? lastUsedResult.data
    : {};

  // No plan yet for today → show planning canvas.
  if (entries.length === 0) {
    if (allFlames.length === 0) {
      return (
        <div className="size-full p-4 pb-24">
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
        </div>
      );
    }

    return (
      <div className="size-full p-4 pb-24">
        <div className="flex justify-end mb-4">
          <FlamesPageActions />
        </div>
        <PlanningCanvas
          flames={allFlames}
          date={today}
          lastUsedTargetsByFlameId={lastUsedTargetsByFlameId}
        />
      </div>
    );
  }

  // Plan exists → tending mode.
  return (
    <div className="size-full p-4 pb-24">
      <FlamesList
        entries={entries}
        date={today}
        fuelBalanceSeconds={fuelBalanceSeconds}
      />
    </div>
  );
}

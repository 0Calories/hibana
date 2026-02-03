import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { FlamesList } from './components/FlamesList';
import { getAllSessionsForDate } from './session-actions';

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default async function FlamesPage() {
  const t = await getTranslations('flames');
  const supabase = await createClient();
  const today = getTodayDateString();

  const [flamesResult, sessionsResult] = await Promise.all([
    supabase.from('flames').select().eq('is_archived', false),
    getAllSessionsForDate(today),
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

  return (
    <div className="size-full p-4 pb-24">
      <h1 className="mb-6 text-2xl font-bold">{t('pageTitle')}</h1>
      {flames.length === 0 ? (
        <p className="text-muted-foreground">{t('empty')}</p>
      ) : (
        <FlamesList flames={flames} initialSessions={sessions} date={today} />
      )}
    </div>
  );
}

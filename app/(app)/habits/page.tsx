import { getTranslations } from 'next-intl/server';

export default async function HabitsPage() {
  const t = await getTranslations('pages');

  return (
    <div className="flex-col min-h-svh w-full items-center justify-center align-center p-4">
      {t('habits')}
    </div>
  );
}

import { ChevronLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getAllFlamesForManagement } from '../actions/flame-actions';
import { ManageFlamesList } from './components/ManageFlamesList';

export default async function ManageFlamesPage() {
  const t = await getTranslations('flames.manage');
  const result = await getAllFlamesForManagement();
  const flames = result.success ? result.data : [];

  return (
    <div className="size-full p-4 pb-24">
      <div className="flex items-center gap-2 mb-4">
        <Link
          href="/flames"
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
        >
          <ChevronLeftIcon className="size-5" />
        </Link>
        <h1 className="text-lg font-semibold">{t('pageTitle')}</h1>
      </div>
      <ManageFlamesList flames={flames} />
    </div>
  );
}

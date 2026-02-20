import { getTranslations } from 'next-intl/server';
import { getAllFlamesForManagement } from '../actions';
import { ManageFlamesList } from './components/ManageFlamesList';

export default async function ManageFlamesPage() {
  const t = await getTranslations('flames.manage');
  const result = await getAllFlamesForManagement();
  const flames = result.success ? result.data : [];

  return (
    <div className="size-full p-4 pb-24">
      <ManageFlamesList flames={flames} />
    </div>
  );
}

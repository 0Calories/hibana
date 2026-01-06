import { createClient } from '@/utils/supabase/server';
import { StickyNoteBoard } from './components/StickyNoteBoard';

export default async function DashboardPage() {
  const supabase = await createClient();
  const result = await supabase.from('tasks').select();

  if (!result) {
    return 'Loading ...';
  }

  const tasks = result.data;

  return (
    <div className="size-full p-4 pb-24">
      {tasks && <StickyNoteBoard tasks={tasks} />}
    </div>
  );
}

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/server';
import type { Task } from '@/utils/supabase/types';
import { StickyNote } from '../components/StickyNote';

const cardColors = [
  'bg-red-400 dark:bg-red-400',
  'bg-orange-400 dark:bg-orange-400',
  'bg-amber-400 dark:bg-amber-400',
  'bg-yellow-400 dark:bg-yellow-400',
  'bg-lime-400 dark:bg-lime-400',
  'bg-green-400 dark:bg-green-400',
  'bg-emerald-400 dark:bg-emerald-400',
  'bg-teal-400 dark:bg-teal-400',
  'bg-cyan-400 dark:bg-cyan-400',
  'bg-sky-400 dark:bg-sky-400',
  'bg-blue-400 dark:bg-blue-400',
  'bg-indigo-400 dark:bg-indigo-400',
  'bg-violet-400 dark:bg-violet-400',
  'bg-purple-400 dark:bg-purple-400',
  'bg-fuchsia-400 dark:bg-fuchsia-400',
  'bg-pink-400 dark:bg-pink-400',
  'bg-rose-400 dark:bg-rose-400',
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const tasks = await supabase.from('tasks').select();
  console.dir(tasks);

  return (
    <div className="size-full p-4 pb-24">
      <Image
        src={'/ember.png'}
        alt={'Ember'}
        width={48}
        height={48}
        className="fixed bottom-30 shadow-xl"
      />

      <div className="mt-6 columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
        {tasks.data?.map((task: Task, index) => {
          return (
            <StickyNote
              key={task.id}
              data={task}
              colorClass={cardColors[index % cardColors.length]}
            />
          );
        })}
      </div>
    </div>
  );
}

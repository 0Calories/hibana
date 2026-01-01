import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/server';

const cardColors = [
  'bg-red-400 dark:bg-red-400/90',
  'bg-orange-400 dark:bg-orange-400/90',
  'bg-amber-400 dark:bg-amber-400/90',
  'bg-yellow-400 dark:bg-yellow-400/90',
  'bg-lime-400 dark:bg-lime-400/90',
  'bg-green-400 dark:bg-green-400/90',
  'bg-emerald-400 dark:bg-emerald-400/90',
  'bg-teal-400 dark:bg-teal-400/90',
  'bg-cyan-400 dark:bg-cyan-400/90',
  'bg-sky-400 dark:bg-sky-400/90',
  'bg-blue-400 dark:bg-blue-400/90',
  'bg-indigo-400 dark:bg-indigo-400/90',
  'bg-violet-400 dark:bg-violet-400/90',
  'bg-purple-400 dark:bg-purple-400/90',
  'bg-fuchsia-400 dark:bg-fuchsia-400/90',
  'bg-pink-400 dark:bg-pink-400/90',
  'bg-rose-400 dark:bg-rose-400/90',
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const todos = await supabase.from('todos').select();
  console.dir(todos);

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
        {todos.data?.map((todo, index) => {
          const colorClass = cardColors[index % cardColors.length];
          return (
            <Card
              key={todo.id}
              className={`${colorClass} break-inside-avoid mb-4 cursor-pointer`}
            >
              <CardContent className="p-4">
                {todo.title && (
                  <h3 className="font-semibold text-base mb-2 text-foreground">
                    {todo.title}
                  </h3>
                )}
                {todo.content && (
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                    {todo.content}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

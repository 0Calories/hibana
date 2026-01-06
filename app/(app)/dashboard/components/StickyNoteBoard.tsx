'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import type { Note, Task } from '@/utils/supabase/types';
import { StickyNoteDialog } from './StickyNoteDialog';

const CARD_COLOURS = [
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

type Props = {
  tasks: Task[];
};

type StickyNote = {
  data: Task | Note;
  color: string;
} | null;

export function StickyNoteBoard({ tasks }: Props) {
  const [selectedNote, setSelectedNote] = useState<StickyNote>(null);

  return (
    <Dialog
      open={!!selectedNote}
      onOpenChange={(open) => !open && setSelectedNote(null)}
    >
      <Image
        src={'/ember.png'}
        alt={'Ember'}
        width={48}
        height={48}
        className="fixed bottom-30 shadow-xl"
      />

      <div className="mt-6 columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
        {tasks?.map((task, index) => {
          const colorClass = CARD_COLOURS[index % CARD_COLOURS.length];
          return (
            <Card
              key={task.id}
              className={`${colorClass} break-inside-avoid mb-4 cursor-pointer`}
              onClick={() => setSelectedNote({ data: task, color: colorClass })}
            >
              <CardHeader className="font-semibold text-base text-foreground">
                {task.title}
              </CardHeader>
              <CardContent>{task.content}</CardContent>
            </Card>
          );
        })}
      </div>

      <StickyNoteDialog data={selectedNote?.data} color={selectedNote?.color} />
    </Dialog>
  );
}

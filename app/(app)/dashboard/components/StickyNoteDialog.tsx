import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Note, Task } from '@/utils/supabase/types';

// Dialog component for rendering the full content of a sticky note on the dashboard when clicked
type Props = {
  data: Task | Note | undefined | null;
  color?: string;
};

export function StickyNoteDialog({ data, color }: Props) {
  if (!data) {
    return null;
  }

  return (
    <DialogContent
      className={`opacity-100 ${color} flex flex-col w-4/5 h-4/6 p-6`}
    >
      <DialogHeader>
        <DialogTitle>{data.title ?? ''}</DialogTitle>
      </DialogHeader>
      {data.content ?? ''}
    </DialogContent>
  );
}

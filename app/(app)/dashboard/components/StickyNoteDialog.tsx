import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Note, Task } from '@/utils/supabase/types';

// Dialog component for rendering the full content of a sticky note on the dashboard when clicked
type Props = {
  data: Task | Note | undefined | null;
};

export function StickyNoteDialog({ data }: Props) {
  return (
    <DialogContent className="flex flex-col w-4/5 h-4/6 p-6">
      <DialogHeader>
        <DialogTitle>{data?.title ?? ''}</DialogTitle>
      </DialogHeader>
      {data?.content ?? ''}
    </DialogContent>
  );
}

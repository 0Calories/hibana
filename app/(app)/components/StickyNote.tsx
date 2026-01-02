import { Card, CardContent } from '@/components/ui/card';
import type { Task } from '@/utils/supabase/types';

type Props = {
  data: Task;
  colorClass?: string;
};

export function StickyNote({ data, colorClass }: Props) {
  const { title, content, status, effort, priority } = data;

  return (
    <Card
      className={`${colorClass ?? 'bg-teal-400/90'} break-inside-avoid mb-4 cursor-pointer`}
    >
      <CardContent className="p-4">
        {title && (
          <h3 className="font-semibold text-base mb-2 text-foreground">
            {title}
          </h3>
        )}
        {content && (
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">
            {content}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

import {
  CalendarCheckIcon,
  ListTodoIcon,
  NotebookPenIcon,
  PlusIcon,
  SparklesIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function CreateButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="radius-lg size-10">
          <PlusIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="m-4">
        <DropdownMenuLabel>Create new</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <NotebookPenIcon /> Note
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ListTodoIcon /> Todo
        </DropdownMenuItem>
        <DropdownMenuItem>
          <SparklesIcon />
          Habit
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CalendarCheckIcon /> Schedule
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

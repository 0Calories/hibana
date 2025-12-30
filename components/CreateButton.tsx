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
        <Button size={'icon-lg'} className="radius-lg">
          <PlusIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Create a new</DropdownMenuLabel>
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

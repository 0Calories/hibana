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
      <DropdownMenuContent className="m-4 md:m-0 md:mb-2">
        <DropdownMenuLabel>Create new</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <CreateTodoButton />
        <CreateNoteButton />
        <CreateHabitButton />
        <CreateScheduleButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CreateTodoButton() {
  return (
    <DropdownMenuItem>
      <ListTodoIcon /> Todo
    </DropdownMenuItem>
  );
}

function CreateNoteButton() {
  return (
    <DropdownMenuItem>
      <NotebookPenIcon /> Note
    </DropdownMenuItem>
  );
}

function CreateHabitButton() {
  return (
    <DropdownMenuItem>
      <SparklesIcon />
      Habit
    </DropdownMenuItem>
  );
}

function CreateScheduleButton() {
  return (
    <DropdownMenuItem>
      <CalendarCheckIcon /> Schedule
    </DropdownMenuItem>
  );
}

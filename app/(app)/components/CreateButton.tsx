'use client';

import {
  CalendarCheckIcon,
  ListTodoIcon,
  NotebookPenIcon,
  PlusIcon,
  SparklesIcon,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '../../../components/ui/button';
import { Dialog, DialogTrigger } from '../../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { CreationDialog } from './CreationDialog';

export function CreateButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <CreationDialog setOpen={setOpen} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-lg size-10">
            <PlusIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="m-4 md:m-0 md:mb-2">
          <DropdownMenuLabel>Create new</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <CreateTaskButton />
          <CreateNoteButton />
          <CreateHabitButton />
          <CreateScheduleButton />
        </DropdownMenuContent>
      </DropdownMenu>
    </Dialog>
  );
}

function CreateTaskButton() {
  return (
    <DialogTrigger asChild>
      <DropdownMenuItem>
        <ListTodoIcon /> Task
      </DropdownMenuItem>
    </DialogTrigger>
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

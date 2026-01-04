'use client';

import {
  CalendarCheckIcon,
  ListTodoIcon,
  NotebookPenIcon,
  PlusIcon,
  SparklesIcon,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreationDialog, type CreationDialogMode } from './CreationDialog';

export function CreateButton() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CreationDialogMode>('task');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <CreationDialog setOpen={setOpen} mode={mode} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-lg size-10">
            <PlusIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="m-4 md:m-0 md:mb-2">
          <DropdownMenuLabel>Create new</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DialogTrigger asChild>
            <DropdownMenuItem onClick={() => setMode('task')}>
              <ListTodoIcon /> Task
            </DropdownMenuItem>
          </DialogTrigger>

          <DialogTrigger asChild>
            <DropdownMenuItem onClick={() => setMode('note')}>
              <NotebookPenIcon /> Note
            </DropdownMenuItem>
          </DialogTrigger>

          <DialogTrigger asChild>
            <DropdownMenuItem onClick={() => setMode('habit')}>
              <SparklesIcon />
              Habit
            </DropdownMenuItem>
          </DialogTrigger>

          <DialogTrigger asChild disabled>
            <DropdownMenuItem onClick={() => setMode('schedule')}>
              <CalendarCheckIcon /> Schedule
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
    </Dialog>
  );
}

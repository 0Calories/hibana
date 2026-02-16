'use client';

import {
  CalendarCheckIcon,
  FlameIcon,
  ListTodoIcon,
  NotebookPenIcon,
  PlusIcon,
  SparklesIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('dashboard');
  const tModes = useTranslations('dashboard.modes');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <CreationDialog setOpen={setOpen} mode={mode} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <PlusIcon className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="m-4 md:m-0 md:mb-2">
          <DropdownMenuLabel>{t('createNew')}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DialogTrigger asChild>
            <DropdownMenuItem onClick={() => setMode('flame')}>
              <FlameIcon /> {tModes('flame')}
            </DropdownMenuItem>
          </DialogTrigger>

          <DialogTrigger asChild disabled>
            <DropdownMenuItem onClick={() => setMode('habit')}>
              <SparklesIcon />
              {tModes('habit')}
            </DropdownMenuItem>
          </DialogTrigger>

          <DropdownMenuSeparator />

          <DialogTrigger asChild>
            <DropdownMenuItem onClick={() => setMode('task')}>
              <ListTodoIcon /> {tModes('task')}
            </DropdownMenuItem>
          </DialogTrigger>

          <DialogTrigger asChild>
            <DropdownMenuItem onClick={() => setMode('note')}>
              <NotebookPenIcon /> {tModes('note')}
            </DropdownMenuItem>
          </DialogTrigger>

          <DropdownMenuSeparator />

          <DialogTrigger asChild disabled>
            <DropdownMenuItem onClick={() => setMode('schedule')}>
              <CalendarCheckIcon /> {tModes('schedule')}
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
    </Dialog>
  );
}

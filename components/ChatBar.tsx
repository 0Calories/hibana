'use client';

import {
  CalendarDaysIcon,
  ListTodoIcon,
  NotebookPenIcon,
  PlusIcon,
  SparklesIcon,
} from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function ChatBar() {
  return (
    <InputGroup className="rounded-full p-6 pl-2 pr-2">
      <InputGroupInput placeholder="Ask Ember to do something ..." />
      <InputGroupAddon align="inline-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size={'icon-lg'} className="rounded-full">
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
              <CalendarDaysIcon /> Schedule
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </InputGroupAddon>
    </InputGroup>
  );
}

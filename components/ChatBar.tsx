'use client';

import {
  CalendarCheckIcon,
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
    <InputGroup className="radius-lg p-5 pl-2 pr-2 mr-2">
      <InputGroupInput placeholder="Ask Ember to do something ..." />
      <InputGroupAddon align="inline-end"></InputGroupAddon>
    </InputGroup>
  );
}

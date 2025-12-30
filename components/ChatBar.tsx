'use client';

import { PlusIcon, StarIcon } from 'lucide-react';
import { useState } from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Button } from './ui/button';

export function ChatBar() {
  const [isFavorite, setIsFavorite] = useState(false);
  return (
    <InputGroup className="rounded-full p-6 pl-2 pr-2">
      <InputGroupInput id="input-secure-19" placeholder="Write a note" />
      <InputGroupAddon align="inline-end">
        <Button size={'icon-lg'} className="rounded-full">
          <PlusIcon />
        </Button>
      </InputGroupAddon>
    </InputGroup>
  );
}

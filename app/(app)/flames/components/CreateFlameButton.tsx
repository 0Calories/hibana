'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { CreateFlameDialog } from './CreateFlameDialog';

export function CreateFlameButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className="rounded-lg size-10" onClick={() => setOpen(true)}>
        <PlusIcon />
      </Button>
      <CreateFlameDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

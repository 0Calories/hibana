'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { CreateFlameDialog } from './CreateFlameDialog';

export function CreateFlameButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Create flame"
        className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 transition-transform duration-150 active:scale-90"
      >
        <PlusIcon className="size-5 stroke-[2.5]" aria-hidden="true" />
      </button>
      <CreateFlameDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

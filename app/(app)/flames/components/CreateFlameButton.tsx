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
        className="group relative flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95"
      >
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-md transition-opacity group-hover:opacity-100 opacity-60" />
        <PlusIcon className="relative size-5" />
      </button>
      <CreateFlameDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

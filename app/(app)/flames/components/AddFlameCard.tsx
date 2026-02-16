'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { CreateFlameDialog } from './CreateFlameDialog';

export function AddFlameCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary active:scale-[0.98]"
      >
        <PlusIcon className="size-6" />
      </button>
      <CreateFlameDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

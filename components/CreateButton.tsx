'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  CalendarCheckIcon,
  ListTodoIcon,
  NotebookPen,
  NotebookPenIcon,
  PlusIcon,
  SparklesIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/client';
import type { TablesInsert } from '@/utils/supabase/types';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

const todoSchema = z.object({
  content: z.string().min(1, 'You gotta write something!'),
});

type TodoFormData = z.infer<typeof todoSchema>;

export function CreateButton() {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      reset();
    }
  };

  const onSubmit = async (data: TodoFormData) => {
    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error('You must be logged in to create a todo');
        return;
      }

      const todoData: TablesInsert<'todos'> = {
        content: data.content || null,
        user: user.id,
      };

      // Insert the todo
      const { error } = await supabase.from('todos').insert(todoData);

      if (error) {
        toast.error(`Failed to create todo: ${error.message}`);
        return;
      }

      toast.success('Todo created successfully!');
      reset();
      setOpen(false);
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Error creating todo:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="radius-lg size-10">
            <PlusIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="m-4 md:m-0 md:mb-2">
          <DropdownMenuLabel>Create new</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <CreateTodoButton />
          <CreateNoteButton />
          <CreateHabitButton />
          <CreateScheduleButton />
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="flex flex-col w-4/5 h-4/6 p-6">
        <DialogHeader>
          <DialogTitle>
            <Label>
              <NotebookPen /> New Todo
            </Label>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 gap-2 min-h-0"
        >
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <Textarea
              id="content"
              placeholder="Add some details ..."
              className="flex-1 resize-none"
              {...register('content')}
            />
            {errors.content && (
              <p className="text-sm text-destructive">
                {errors.content.message}
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Done'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateTodoButton() {
  return (
    <DialogTrigger asChild>
      <DropdownMenuItem>
        <ListTodoIcon /> Todo
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

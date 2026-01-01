'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  CalendarCheckIcon,
  ListTodoIcon,
  NotebookPenIcon,
  PlusIcon,
  SparklesIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { createTodo } from '../dashboard/actions';

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
    const toastId = toast.loading('Creating Todo ...', {
      position: 'top-center',
    });

    try {
      const result = await createTodo(data.content);
      if (result.error) {
        toast.error(
          `Failed to create Todo: ${result.error.message || 'unknown error'}`,
          {
            id: toastId,
            position: 'top-center',
          },
        );
        return;
      }

      toast.success('Todo created successfully!', {
        id: toastId,
        position: 'top-center',
      });

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
          <Button className="rounded-lg size-10">
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
              <NotebookPenIcon /> New Todo
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
              Save
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

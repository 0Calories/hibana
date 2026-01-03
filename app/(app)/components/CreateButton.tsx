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
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Field } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
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
import { Textarea } from '../../../components/ui/textarea';
import { createTask } from '../dashboard/actions';

const taskSchema = z.object({
  title: z.string().min(1, 'Title must not be empty'),
  content: z.string(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export function CreateButton() {
  const [open, setOpen] = useState(false);
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: 'New Task',
      content: '',
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      reset();
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    const toastId = toast.loading('Creating Task ...', {
      position: 'top-center',
    });

    try {
      const result = await createTask(data.content);
      if (result.error) {
        toast.error(
          `Failed to create Task: ${result.error.message || 'unknown error'}`,
          {
            id: toastId,
            position: 'top-center',
          },
        );
        return;
      }

      toast.success('Task created successfully!', {
        id: toastId,
        position: 'top-center',
      });

      reset();
      setOpen(false);
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Error creating task:', error);
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

          <CreateTaskButton />
          <CreateNoteButton />
          <CreateHabitButton />
          <CreateScheduleButton />
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="flex flex-col w-4/5 h-4/6 p-6">
        <form
          id="new-task"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0 gap-4"
        >
          <DialogHeader className="pt-4">
            <DialogTitle>
              <Controller
                name="title"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="Title"
                      />
                      <InputGroupAddon>
                        <NotebookPenIcon />
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                )}
              />
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <Controller
              name="content"
              control={control}
              render={({ field, fieldState }) => (
                <Textarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Add optional details ..."
                  className="flex-1 resize-none"
                />
              )}
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

function CreateTaskButton() {
  return (
    <DialogTrigger asChild>
      <DropdownMenuItem>
        <ListTodoIcon /> Task
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

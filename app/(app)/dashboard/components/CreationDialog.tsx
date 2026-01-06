'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  CalendarCheckIcon,
  ListTodoIcon,
  NotebookPenIcon,
  SparklesIcon,
} from 'lucide-react';
import { type ReactNode, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Textarea } from '@/components/ui/textarea';
import { createTask } from '../actions';

const taskSchema = z.object({
  title: z.string().min(1, 'Title must not be empty'),
  content: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export type CreationDialogMode = 'task' | 'note' | 'habit' | 'schedule';

type Props = {
  setOpen: (open: boolean) => void;
  mode: CreationDialogMode;
};

const MODE_TO_ICON: Record<CreationDialogMode, ReactNode> = {
  task: <ListTodoIcon />,
  note: <NotebookPenIcon />,
  habit: <SparklesIcon />,
  schedule: <CalendarCheckIcon />,
};

export function CreationDialog({ setOpen, mode }: Props) {
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: `New ${mode}`,
    },
  });

  // Reset the default title when a new mode is selected
  useEffect(() => {
    reset({ title: `New ${mode}` });
  }, [mode, reset]);

  const onSubmit = async (data: TaskFormData) => {
    const toastId = toast.loading('Creating Task ...', {
      position: 'top-center',
    });

    try {
      const result = await createTask(data.title, data.content);
      if (result.error) {
        // TODO: Extract out a constant to map data types to display values: icon, display name, etc. Include i8n support
        toast.error(
          `Failed to create ${mode}: ${result.error.message || 'unknown error'}`,
          {
            id: toastId,
            position: 'top-center',
          },
        );
        return;
      }

      toast.success(`${mode} created successfully!`, {
        id: toastId,
        position: 'top-center',
      });

      reset();
      setOpen(false);
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(`Error creating ${mode}:`, error);
    }
  };

  return (
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
                    <InputGroupAddon>{MODE_TO_ICON[mode]}</InputGroupAddon>
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
            <p className="text-sm text-destructive">{errors.content.message}</p>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

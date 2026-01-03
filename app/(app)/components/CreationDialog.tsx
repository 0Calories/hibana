'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { NotebookPenIcon } from 'lucide-react';
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
import { createTask } from '../dashboard/actions';

const taskSchema = z.object({
  title: z.string().min(1, 'Title must not be empty'),
  content: z.string(),
});

type TaskFormData = z.infer<typeof taskSchema>;

type Props = {
  setOpen: (open: boolean) => void;
};

export function CreationDialog({ setOpen }: Props) {
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

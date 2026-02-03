'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  CalendarCheckIcon,
  FlameIcon,
  ListTodoIcon,
  NotebookPenIcon,
  SparklesIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type ReactNode, useEffect, useMemo } from 'react';
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

const baseTaskSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
});

type TaskFormData = z.infer<typeof baseTaskSchema>;

function createTaskSchema(t: (key: string) => string) {
  return z.object({
    title: z.string().min(1, t('titleRequired')),
    content: z.string().optional(),
  });
}

export type CreationDialogMode =
  | 'task'
  | 'note'
  | 'flame'
  | 'habit'
  | 'schedule';

type Props = {
  setOpen: (open: boolean) => void;
  mode: CreationDialogMode;
};

const MODE_TO_ICON: Record<CreationDialogMode, ReactNode> = {
  task: <ListTodoIcon />,
  note: <NotebookPenIcon />,
  flame: <FlameIcon />,
  habit: <SparklesIcon />,
  schedule: <CalendarCheckIcon />,
};

export function CreationDialog({ setOpen, mode }: Props) {
  const t = useTranslations('dashboard.creation');
  const tModes = useTranslations('dashboard.modes');
  const tValidation = useTranslations('validation');
  const tCommon = useTranslations('common');

  const taskSchema = useMemo(
    () => createTaskSchema(tValidation as unknown as (key: string) => string),
    [tValidation],
  );

  const modeLabel = tModes(mode);

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: t('defaultTitle', { mode: modeLabel }),
    },
  });

  // Reset the default title when a new mode is selected
  useEffect(() => {
    reset({ title: t('defaultTitle', { mode: modeLabel }) });
  }, [modeLabel, reset, t]);

  const onSubmit = async (data: TaskFormData) => {
    const toastId = toast.loading(t('loading', { mode: modeLabel }), {
      position: 'top-center',
    });

    try {
      const result = await createTask(data.title, data.content);
      if (result.error) {
        toast.error(
          t('error', {
            mode: modeLabel,
            error: result.error.message || 'unknown error',
          }),
          {
            id: toastId,
            position: 'top-center',
          },
        );
        return;
      }

      toast.success(t('success', { mode: modeLabel }), {
        id: toastId,
        position: 'top-center',
      });

      reset();
      setOpen(false);
    } catch (error) {
      toast.error(tCommon('unexpectedError'));
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
                      placeholder={t('titlePlaceholder')}
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
                placeholder={t('detailsPlaceholder')}
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
            {tCommon('save')}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

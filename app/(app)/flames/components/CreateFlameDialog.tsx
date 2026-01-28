'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FlameIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ColorPickerGrid } from '@/components/ColorPickerGrid';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  type CreateFlameFormData,
  createFlameSchema,
} from '@/lib/schemas/flame';
import { createFlame } from '../flame-actions';

interface CreateFlameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFlameDialog({
  open,
  onOpenChange,
}: CreateFlameDialogProps) {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateFlameFormData>({
    resolver: zodResolver(createFlameSchema),
    defaultValues: {
      name: '',
      color: '#f43f5e',
      tracking_type: 'time',
      is_daily: true,
      schedule: [],
    },
  });

  const trackingType = watch('tracking_type');
  const isDaily = watch('is_daily');

  const onSubmit = async (data: CreateFlameFormData) => {
    const toastId = toast.loading('Creating flame...', {
      position: 'top-center',
    });

    // const result = await createFlame(
    //   {
    //     name: data.name,
    //     icon: data.icon,
    //     color: data.color,
    //     tracking_type: data.tracking_type,
    //     time_budget_minutes: data.time_budget_minutes,
    //     count_target: data.count_target,
    //     count_unit: data.count_unit,
    //     is_daily: data.is_daily,
    //   },
    //   data.schedule,
    // );

    // if (result.success) {
    //   toast.success('Flame created!', { id: toastId, position: 'top-center' });
    //   reset();
    //   onOpenChange(false);
    // } else {
    //   toast.error(result.error.message, {
    //     id: toastId,
    //     position: 'top-center',
    //   });
    // }
  };

  const renderFlameStyleButton = () => (
    <Controller
      name="color"
      control={control}
      render={({ field }) => (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="size-10 rounded-lg flex items-center justify-center shrink-0 transition-transform hover:scale-105"
              style={{ backgroundColor: field.value }}
            >
              <FlameIcon className="size-6" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto">
            <ColorPickerGrid value={field.value} onChange={field.onChange} />
          </PopoverContent>
        </Popover>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col w-4/5 h-4/6 p-6">
        <form
          id="create-flame"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0 gap-4"
        >
          <DialogHeader className="pt-4">
            <DialogTitle>
              <div className="flex items-center gap-2">
                {renderFlameStyleButton()}
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="flex-1">
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="New Flame"
                      />
                    </Field>
                  )}
                />
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col gap-2 min-h-0"></div>

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

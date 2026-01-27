'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  createFlameSchema,
  type CreateFlameFormData,
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

    const result = await createFlame(
      {
        name: data.name,
        icon: data.icon,
        color: data.color,
        tracking_type: data.tracking_type,
        time_budget_minutes: data.time_budget_minutes,
        count_target: data.count_target,
        count_unit: data.count_unit,
        is_daily: data.is_daily,
      },
      data.schedule,
    );

    if (result.success) {
      toast.success('Flame created!', { id: toastId, position: 'top-center' });
      reset();
      onOpenChange(false);
    } else {
      toast.error(result.error.message, {
        id: toastId,
        position: 'top-center',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Flame</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            {/* Name + Icon + Color row */}
            <div className="flex gap-2">
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field className="flex-1" data-invalid={fieldState.invalid}>
                    <FieldLabel>Name</FieldLabel>
                    <Input {...field} placeholder="Meditation" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {/* TODO: IconPicker */}
              {/* TODO: ColorPicker */}
            </div>

            {/* TODO: CategorySelect */}

            {/* Tracking Type Toggle */}
            <Controller
              name="tracking_type"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Tracking Type</FieldLabel>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={field.value === 'time' ? 'default' : 'outline'}
                      onClick={() => field.onChange('time')}
                    >
                      Time
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === 'count' ? 'default' : 'outline'}
                      onClick={() => field.onChange('count')}
                    >
                      Count
                    </Button>
                  </div>
                </Field>
              )}
            />

            {/* Conditional: Time Budget */}
            {trackingType === 'time' && (
              <Controller
                name="time_budget_minutes"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Time Budget (minutes)</FieldLabel>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}

            {/* Conditional: Count Target + Unit */}
            {trackingType === 'count' && (
              <div className="flex gap-2">
                <Controller
                  name="count_target"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field className="flex-1" data-invalid={fieldState.invalid}>
                      <FieldLabel>Target</FieldLabel>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined,
                          )
                        }
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="count_unit"
                  control={control}
                  render={({ field }) => (
                    <Field className="flex-1">
                      <FieldLabel>Unit</FieldLabel>
                      <Input {...field} placeholder="pages, reps, etc." />
                    </Field>
                  )}
                />
              </div>
            )}

            {/* Day of Week Picker */}
            <Controller
              name="is_daily"
              control={control}
              render={({ field: dailyField }) => (
                <Field>
                  <FieldLabel>Schedule</FieldLabel>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dailyField.value}
                        onChange={(e) => dailyField.onChange(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Daily</span>
                    </label>

                    {!isDaily && (
                      <Controller
                        name="schedule"
                        control={control}
                        render={({ field: scheduleField, fieldState }) => (
                          <div>
                            <div className="flex gap-1">
                              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(
                                (day, index) => {
                                  const isSelected =
                                    scheduleField.value?.includes(index);
                                  return (
                                    <Button
                                      key={day}
                                      type="button"
                                      size="sm"
                                      variant={
                                        isSelected ? 'default' : 'outline'
                                      }
                                      onClick={() => {
                                        const current =
                                          scheduleField.value ?? [];
                                        if (isSelected) {
                                          scheduleField.onChange(
                                            current.filter((d) => d !== index),
                                          );
                                        } else {
                                          scheduleField.onChange([
                                            ...current,
                                            index,
                                          ]);
                                        }
                                      }}
                                    >
                                      {day}
                                    </Button>
                                  );
                                },
                              )}
                            </div>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </div>
                        )}
                      />
                    )}
                  </div>
                </Field>
              )}
            />
          </FieldGroup>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Create Flame
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

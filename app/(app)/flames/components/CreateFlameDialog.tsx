'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FlameIcon, FlameKindlingIcon, HourglassIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ColorPickerGrid } from '@/app/(app)/flames/components/ColorPickerGrid';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  type CreateFlameFormData,
  createFlameSchema,
} from '@/lib/schemas/flame';
import { cn } from '@/lib/utils';
import { createFlame } from '../actions/flame-actions';
import { FLAME_GRADIENT_CLASSES, type FlameColorName } from '../utils/colors';

interface CreateFlameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFlameDialog({
  open,
  onOpenChange,
}: CreateFlameDialogProps) {
  const t = useTranslations('flames.create');
  const tCommon = useTranslations('common');

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
      color: 'rose',
      tracking_type: 'time',
      time_budget_minutes: 60,
      count_target: 10,
      is_daily: true,
    },
  });

  const trackingType = watch('tracking_type');

  const onSubmit = async (data: CreateFlameFormData) => {
    const toastId = toast.loading(t('loading'), {
      position: 'top-center',
    });

    const result = await createFlame({
      name: data.name,
      icon: null,
      color: data.color,
      tracking_type: data.tracking_type,
      time_budget_minutes: data.time_budget_minutes ?? null,
      count_target: data.count_target ?? null,
      count_unit: data.count_unit ?? 'number',
      is_daily: data.is_daily,
    });

    if (result.success) {
      toast.success(t('success'), { id: toastId, position: 'top-center' });
      reset();
      onOpenChange(false);
    } else {
      toast.error(result.error.message, {
        id: toastId,
        position: 'top-center',
      });
    }
  };

  const renderFlameStyleButton = () => (
    <Controller
      name="color"
      control={control}
      render={({ field }) => {
        const color = field.value as FlameColorName;
        const gradientClass = FLAME_GRADIENT_CLASSES[color];

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  'size-9 rounded-lg flex items-center justify-center shrink-0 transition-transform cursor-pointer',
                  gradientClass,
                )}
              >
                <FlameIcon className="size-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto">
              <ColorPickerGrid
                value={color as FlameColorName}
                onChange={field.onChange}
              />
            </PopoverContent>
          </Popover>
        );
      }}
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
                        placeholder={t('namePlaceholder')}
                      />
                    </Field>
                  )}
                />
              </div>
            </DialogTitle>
          </DialogHeader>

          <Separator />

          <div className="flex-1 flex flex-col gap-8 min-h-0">
            {/* Tracking Type Toggle */}
            <Controller
              name="tracking_type"
              control={control}
              render={({ field }) => (
                <Field orientation="horizontal" className="justify-between">
                  <div className="flex flex-col gap-1">
                    <FieldLabel htmlFor="tracking_type">
                      {t('trackingType')}
                    </FieldLabel>
                    <FieldDescription>
                      {field.value === 'time'
                        ? t('trackingTime')
                        : t('trackingRepetitions')}
                    </FieldDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <FlameKindlingIcon
                      className={cn(
                        'size-4',
                        field.value === 'count'
                          ? 'text-foreground'
                          : 'text-muted-foreground',
                      )}
                    />
                    <Switch
                      id="tracking_type"
                      checked={field.value === 'time'}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? 'time' : 'count')
                      }
                    />
                    <HourglassIcon
                      className={cn(
                        'size-4',
                        field.value === 'time'
                          ? 'text-foreground'
                          : 'text-muted-foreground',
                      )}
                    />
                  </div>
                </Field>
              )}
            />

            {/* Fuel Budget Field */}
            {trackingType === 'time' ? (
              <Controller
                name="time_budget_minutes"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="time_budget_minutes">
                      {t('fuelBudget')}
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type="number"
                        min={1}
                        aria-invalid={fieldState.invalid}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined,
                          )
                        }
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>{t('unitMinutes')}</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                )}
              />
            ) : (
              <Controller
                name="count_target"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="count_target">
                      {t('targetCount')}
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type="number"
                        min={1}
                        placeholder="10"
                        aria-invalid={fieldState.invalid}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined,
                          )
                        }
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>{t('unitTimes')}</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                )}
              />
            )}

            {/* Daily Checkbox */}
            <Controller
              name="is_daily"
              control={control}
              render={({ field }) => (
                <Field orientation="horizontal" className="justify-self-end">
                  <div className="flex flex-col gap-1">
                    <FieldLabel htmlFor="is_daily">{t('daily')}</FieldLabel>
                  </div>
                  <Checkbox
                    id="is_daily"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              )}
            />
          </div>

          <Separator />

          <div className="flex gap-2 justify-end pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {tCommon('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

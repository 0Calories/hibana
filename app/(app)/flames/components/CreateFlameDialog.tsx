'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FlameIcon, FlameKindlingIcon, HourglassIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ColorPickerGrid } from '@/app/(app)/flames/components/ColorPickerGrid';
import { EffectsRenderer } from '@/app/(app)/flames/components/flame-card/effects/EffectsRenderer';
import { FlameRenderer } from '@/app/(app)/flames/components/flame-card/effects/FlameRenderer';
import { FLAME_REGISTRY } from '@/app/(app)/flames/components/flame-card/flames';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Switch } from '@/components/ui/switch';
import {
  type CreateFlameFormData,
  createFlameSchema,
} from '@/lib/schemas/flame';
import { cn } from '@/lib/utils';
import type { Flame } from '@/utils/supabase/rows';
import { createFlame, updateFlame } from '../actions/flame-actions';
import {
  FLAME_GRADIENT_CLASSES,
  type FlameColorName,
  getFlameColors,
} from '../utils/colors';

interface CreateFlameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flame?: Flame;
}

const defaultCreateValues: CreateFlameFormData = {
  name: '',
  color: 'rose',
  tracking_type: 'time',
  time_budget_minutes: 60,
  count_target: undefined,
  is_daily: true,
};

export function CreateFlameDialog({
  open,
  onOpenChange,
  flame,
}: CreateFlameDialogProps) {
  const t = useTranslations('flames.create');
  const tCommon = useTranslations('common');
  const isEditMode = !!flame;

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateFlameFormData>({
    resolver: zodResolver(createFlameSchema),
    defaultValues: flame
      ? {
          name: flame.name,
          color: flame.color ?? 'rose',
          tracking_type: flame.tracking_type as 'time' | 'count',
          time_budget_minutes: flame.time_budget_minutes ?? 60,
          count_target: flame.count_target ?? undefined,
          is_daily: flame.is_daily,
        }
      : defaultCreateValues,
  });

  useEffect(() => {
    if (flame) {
      reset({
        name: flame.name,
        color: flame.color ?? 'rose',
        tracking_type: flame.tracking_type as 'time' | 'count',
        time_budget_minutes: flame.time_budget_minutes ?? 60,
        count_target: flame.count_target ?? undefined,
        is_daily: flame.is_daily,
      });
    } else {
      reset(defaultCreateValues);
    }
  }, [flame, reset]);

  const trackingType = watch('tracking_type');
  const selectedColor = watch('color') as FlameColorName;
  const flameColors = getFlameColors(selectedColor);

  const onSubmit = async (data: CreateFlameFormData) => {
    const toastId = toast.loading(
      isEditMode ? t('updateLoading') : t('loading'),
      { position: 'top-center' },
    );

    const flameData = {
      name: data.name,
      icon: null,
      color: data.color,
      tracking_type: data.tracking_type,
      time_budget_minutes: data.time_budget_minutes ?? null,
      count_target: data.count_target ?? null,
      count_unit: data.count_unit ?? 'number',
      is_daily: data.is_daily,
    };

    const result = isEditMode
      ? await updateFlame(flame.id, flameData)
      : await createFlame(flameData);

    if (result.success) {
      toast.success(isEditMode ? t('updateSuccess') : t('success'), {
        id: toastId,
        position: 'top-center',
      });
      if (!isEditMode) reset();
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
      <DialogContent className="sm:max-w-md p-6" showCloseButton={false}>
        <form
          id="create-flame"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          {/* Name row with icon placeholder */}
          <DialogHeader>
            <DialogTitle className="sr-only">
              {isEditMode ? t('editTitle') : t('namePlaceholder')}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={cn(
                  'flex shrink-0 items-center justify-center size-8 rounded-lg text-white',
                  FLAME_GRADIENT_CLASSES[selectedColor],
                )}
              >
                <FlameIcon className="size-4" />
              </button>
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
                      className="text-lg"
                      autoComplete="off"
                    />
                  </Field>
                )}
              />
            </div>
          </DialogHeader>

          {/* Live flame preview */}
          <div className="relative flex items-center justify-center h-40 rounded-xl bg-linear-to-b from-black/40 to-black/20 border border-white/5">
            <FlameRenderer
              state="paused"
              level={1}
              colors={flameColors}
              className="h-36 w-28 sm:h-36 sm:w-28 md:h-44 md:w-36"
            />
            <div className="pointer-events-none absolute inset-0">
              <EffectsRenderer
                effects={FLAME_REGISTRY[1].effects}
                state="burning"
                colors={flameColors}
              />
            </div>
          </div>

          {/* Color picker strip */}
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <ColorPickerGrid
                variant="strip"
                value={field.value as FlameColorName}
                onChange={field.onChange}
              />
            )}
          />

          {/* Settings section */}
          <div className="flex flex-col gap-4 rounded-xl bg-muted/50 p-4">
            {/* Segmented control for tracking type */}
            <Controller
              name="tracking_type"
              control={control}
              render={({ field }) => (
                <div className="flex rounded-lg bg-muted p-1">
                  <button
                    type="button"
                    className={cn(
                      'flex-1 inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                      field.value === 'time'
                        ? 'bg-background shadow-sm'
                        : 'text-muted-foreground',
                    )}
                    onClick={() => field.onChange('time')}
                  >
                    <HourglassIcon className="size-3.5" />
                    {t('trackingTime')}
                  </button>
                  <button
                    type="button"
                    className={cn(
                      'flex-1 inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                      field.value === 'count'
                        ? 'bg-background shadow-sm'
                        : 'text-muted-foreground',
                    )}
                    onClick={() => field.onChange('count')}
                  >
                    <FlameKindlingIcon className="size-3.5" />
                    {t('trackingRepetitions')}
                  </button>
                </div>
              )}
            />

            {/* Fuel Budget / Target Count */}
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
                        placeholder="8"
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

            {/* Daily Switch */}
            <Controller
              name="is_daily"
              control={control}
              render={({ field }) => (
                <Field orientation="horizontal" className="justify-self-end">
                  <FieldLabel htmlFor="is_daily">{t('daily')}</FieldLabel>
                  <Switch
                    id="is_daily"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              )}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {tCommon('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

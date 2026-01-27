import { z } from 'zod';

export const createFlameSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    icon: z.string().optional(),
    color: z.string().optional(),
    category_id: z.string().optional(),
    tracking_type: z.enum(['time', 'count']),
    time_budget_minutes: z.number().min(1).optional(),
    count_target: z.number().min(1).optional(),
    count_unit: z.string().optional(),
    is_daily: z.boolean(),
    schedule: z.array(z.number().min(0).max(6)).optional(),
  })
  .refine(
    (data) => {
      if (data.tracking_type === 'time') {
        return data.time_budget_minutes !== undefined;
      }
      return true;
    },
    {
      message: 'Time budget is required for time-based flames',
      path: ['time_budget_minutes'],
    },
  )
  .refine(
    (data) => {
      if (data.tracking_type === 'count') {
        return data.count_target !== undefined;
      }
      return true;
    },
    {
      message: 'Count target is required for count-based flames',
      path: ['count_target'],
    },
  )
  .refine(
    (data) => {
      if (!data.is_daily) {
        return data.schedule && data.schedule.length > 0;
      }
      return true;
    },
    { message: 'Select at least one day', path: ['schedule'] },
  );

export type CreateFlameFormData = z.infer<typeof createFlameSchema>;

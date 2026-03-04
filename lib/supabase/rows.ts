import type { Database } from './types';

export type Task = Database['public']['Tables']['tasks']['Row'];
export type Note = Database['public']['Tables']['notes']['Row'];
export type Flame = Database['public']['Tables']['flames']['Row'];
export type FlameSchedule =
  Database['public']['Tables']['flame_schedules']['Row'];
export type FlameSession =
  Database['public']['Tables']['flame_sessions']['Row'];
export type UserState = Database['public']['Tables']['user_state']['Row'];
export type Item = Database['public']['Tables']['items']['Row'];
export type UserInventory =
  Database['public']['Tables']['user_inventory']['Row'];
export type SparkTransaction =
  Database['public']['Tables']['spark_transactions']['Row'];

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      flame_schedules: {
        Row: {
          day_of_week: number;
          flame_id: string;
        };
        Insert: {
          day_of_week: number;
          flame_id: string;
        };
        Update: {
          day_of_week?: number;
          flame_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'flame_schedules_flame_id_fkey';
            columns: ['flame_id'];
            isOneToOne: false;
            referencedRelation: 'flames';
            referencedColumns: ['id'];
          },
        ];
      };
      flame_sessions: {
        Row: {
          created_at: string;
          date: string;
          duration_seconds: number;
          ended_at: string | null;
          flame_id: string;
          id: string;
          is_completed: boolean;
          notes: string | null;
          started_at: string | null;
        };
        Insert: {
          created_at?: string;
          date?: string;
          duration_seconds?: number;
          ended_at?: string | null;
          flame_id: string;
          id?: string;
          is_completed?: boolean;
          notes?: string | null;
          started_at?: string | null;
        };
        Update: {
          created_at?: string;
          date?: string;
          duration_seconds?: number;
          ended_at?: string | null;
          flame_id?: string;
          id?: string;
          is_completed?: boolean;
          notes?: string | null;
          started_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'flame_sessions_flame_id_fkey';
            columns: ['flame_id'];
            isOneToOne: false;
            referencedRelation: 'flames';
            referencedColumns: ['id'];
          },
        ];
      };
      flames: {
        Row: {
          color: string | null;
          count_target: number | null;
          count_unit: string | null;
          created_at: string;
          icon: string | null;
          id: string;
          is_archived: boolean;
          is_daily: boolean;
          name: string;
          seal_threshold_minutes: number | null;
          time_budget_minutes: number | null;
          tracking_type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          color?: string | null;
          count_target?: number | null;
          count_unit?: string | null;
          created_at?: string;
          icon?: string | null;
          id?: string;
          is_archived?: boolean;
          is_daily?: boolean;
          name: string;
          seal_threshold_minutes?: number | null;
          time_budget_minutes?: number | null;
          tracking_type: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          color?: string | null;
          count_target?: number | null;
          count_unit?: string | null;
          created_at?: string;
          icon?: string | null;
          id?: string;
          is_archived?: boolean;
          is_daily?: boolean;
          name?: string;
          seal_threshold_minutes?: number | null;
          time_budget_minutes?: number | null;
          tracking_type?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      fuel_budgets: {
        Row: {
          day_of_week: number;
          minutes: number;
          user_id: string;
        };
        Insert: {
          day_of_week: number;
          minutes?: number;
          user_id: string;
        };
        Update: {
          day_of_week?: number;
          minutes?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      habits: {
        Row: {
          action: string | null;
          completion_logs: string[] | null;
          created_at: string;
          description: string | null;
          icon: number | null;
          id: number;
          location: string | null;
          name: string | null;
          time: string | null;
          type: number;
          user: string;
        };
        Insert: {
          action?: string | null;
          completion_logs?: string[] | null;
          created_at?: string;
          description?: string | null;
          icon?: number | null;
          id?: number;
          location?: string | null;
          name?: string | null;
          time?: string | null;
          type?: number;
          user: string;
        };
        Update: {
          action?: string | null;
          completion_logs?: string[] | null;
          created_at?: string;
          description?: string | null;
          icon?: number | null;
          id?: number;
          location?: string | null;
          name?: string | null;
          time?: string | null;
          type?: number;
          user?: string;
        };
        Relationships: [];
      };
      notes: {
        Row: {
          content: string | null;
          created_at: string;
          id: number;
          title: string | null;
          user_id: string | null;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          id?: number;
          title?: string | null;
          user_id?: string | null;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          id?: number;
          title?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          id: number;
          user_id: string | null;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          id?: number;
          user_id?: string | null;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          id?: number;
          user_id?: string | null;
          username?: string | null;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          content: string | null;
          created_at: string;
          due_date: string | null;
          effort: number | null;
          id: number;
          parent_task: number | null;
          priority: number | null;
          status: number | null;
          title: string | null;
          user: string | null;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          due_date?: string | null;
          effort?: number | null;
          id?: number;
          parent_task?: number | null;
          priority?: number | null;
          status?: number | null;
          title?: string | null;
          user?: string | null;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          due_date?: string | null;
          effort?: number | null;
          id?: number;
          parent_task?: number | null;
          priority?: number | null;
          status?: number | null;
          title?: string | null;
          user?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'todos_parent_task_fkey';
            columns: ['parent_task'];
            isOneToOne: false;
            referencedRelation: 'tasks';
            referencedColumns: ['id'];
          },
        ];
      };
      waitlist: {
        Row: {
          created_at: string;
          email: string;
          id: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
        };
        Relationships: [];
      };
      weekly_schedule_overrides: {
        Row: {
          day_of_week: number;
          flame_ids: string[];
          flame_minutes: number[];
          minutes: number;
          user_id: string;
          week_start: string;
        };
        Insert: {
          day_of_week: number;
          flame_ids?: string[];
          flame_minutes?: number[];
          minutes: number;
          user_id: string;
          week_start: string;
        };
        Update: {
          day_of_week?: number;
          flame_ids?: string[];
          flame_minutes?: number[];
          minutes?: number;
          user_id?: string;
          week_start?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;

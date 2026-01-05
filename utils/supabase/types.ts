export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  public: {
    Tables: {
      activity_logs: {
        Row: {
          id: number;
          timestamp: string;
        };
        Insert: {
          id?: number;
          timestamp?: string;
        };
        Update: {
          id?: number;
          timestamp?: string;
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
      scheduled_activity: {
        Row: {
          created_at: string;
          day_of_week: number | null;
          description: string | null;
          end_time: string | null;
          icon: number | null;
          id: number;
          is_recurring: boolean | null;
          log_entries: string[] | null;
          name: string | null;
          start_time: string | null;
          user: string | null;
        };
        Insert: {
          created_at?: string;
          day_of_week?: number | null;
          description?: string | null;
          end_time?: string | null;
          icon?: number | null;
          id?: number;
          is_recurring?: boolean | null;
          log_entries?: string[] | null;
          name?: string | null;
          start_time?: string | null;
          user?: string | null;
        };
        Update: {
          created_at?: string;
          day_of_week?: number | null;
          description?: string | null;
          end_time?: string | null;
          icon?: number | null;
          id?: number;
          is_recurring?: boolean | null;
          log_entries?: string[] | null;
          name?: string | null;
          start_time?: string | null;
          user?: string | null;
        };
        Relationships: [];
      };
      time_envelopes: {
        Row: {
          created_at: string;
          description: string | null;
          icon: number | null;
          id: number;
          log_entries: string[] | null;
          name: string | null;
          time_budget: number | null;
          user: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          icon?: number | null;
          id?: number;
          log_entries?: string[] | null;
          name?: string | null;
          time_budget?: number | null;
          user?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          icon?: number | null;
          id?: number;
          log_entries?: string[] | null;
          name?: string | null;
          time_budget?: number | null;
          user?: string | null;
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
            foreignKeyName: 'tasks_parent_task_fkey';
            columns: ['parent_task'];
            isOneToOne: false;
            referencedRelation: 'tasks';
            referencedColumns: ['id'];
          },
        ];
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
  public: {
    Enums: {},
  },
} as const;

// Helper data types
export type Task = Database['public']['Tables']['tasks']['Row'];
export type Note = Database['public']['Tables']['notes']['Row'];

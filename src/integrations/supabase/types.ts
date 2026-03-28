export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string
          id: string
          location: string
          message: string
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          source: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          location: string
          message: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          source?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          location?: string
          message?: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          source?: string | null
        }
        Relationships: []
      }
      analytics_snapshots: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_type: string
          snapshot_date: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type: string
          snapshot_date?: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          snapshot_date?: string
          value?: number
        }
        Relationships: []
      }
      anomaly_insights: {
        Row: {
          affected_equipment: string[] | null
          anomaly_type: string
          confidence: number
          created_at: string
          description: string
          detected_at: string
          id: string
          location: string
          recommended_action: string | null
          severity: string
          status: string
          title: string
        }
        Insert: {
          affected_equipment?: string[] | null
          anomaly_type: string
          confidence: number
          created_at?: string
          description: string
          detected_at?: string
          id?: string
          location: string
          recommended_action?: string | null
          severity: string
          status?: string
          title: string
        }
        Update: {
          affected_equipment?: string[] | null
          anomaly_type?: string
          confidence?: number
          created_at?: string
          description?: string
          detected_at?: string
          id?: string
          location?: string
          recommended_action?: string | null
          severity?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      equipment_inventory: {
        Row: {
          category: string
          created_at: string
          id: string
          install_date: string | null
          location: string
          model: string | null
          name: string
          serial_number: string | null
          specifications: Json | null
          status: string
          updated_at: string
          warranty_expiry: string | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          install_date?: string | null
          location: string
          model?: string | null
          name: string
          serial_number?: string | null
          specifications?: Json | null
          status?: string
          updated_at?: string
          warranty_expiry?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          install_date?: string | null
          location?: string
          model?: string | null
          name?: string
          serial_number?: string | null
          specifications?: Json | null
          status?: string
          updated_at?: string
          warranty_expiry?: string | null
        }
        Relationships: []
      }
      incidents: {
        Row: {
          affected_systems: string[] | null
          assigned_to: string | null
          created_at: string
          description: string
          id: string
          location: string
          reported_by: string
          resolution: string | null
          resolved_at: string | null
          root_cause: string | null
          severity: string
          started_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          affected_systems?: string[] | null
          assigned_to?: string | null
          created_at?: string
          description: string
          id?: string
          location: string
          reported_by: string
          resolution?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity: string
          started_at?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          affected_systems?: string[] | null
          assigned_to?: string | null
          created_at?: string
          description?: string
          id?: string
          location?: string
          reported_by?: string
          resolution?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: string
          started_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      inspection_reports: {
        Row: {
          created_at: string
          findings: string
          id: string
          images: string[] | null
          inspector_id: string | null
          location: string
          recommendations: string | null
          robot_id: string | null
          severity: string
        }
        Insert: {
          created_at?: string
          findings: string
          id?: string
          images?: string[] | null
          inspector_id?: string | null
          location: string
          recommendations?: string | null
          robot_id?: string | null
          severity: string
        }
        Update: {
          created_at?: string
          findings?: string
          id?: string
          images?: string[] | null
          inspector_id?: string | null
          location?: string
          recommendations?: string | null
          robot_id?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_reports_robot_id_fkey"
            columns: ["robot_id"]
            isOneToOne: false
            referencedRelation: "robot_tracking"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          location: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          location: string
          priority: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          location?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      robot_tracking: {
        Row: {
          battery_level: number
          created_at: string
          current_task: string | null
          id: string
          last_inspection: string | null
          location: string
          robot_name: string
          status: string
          tasks_completed: number | null
          updated_at: string
          uptime_hours: number | null
        }
        Insert: {
          battery_level: number
          created_at?: string
          current_task?: string | null
          id?: string
          last_inspection?: string | null
          location: string
          robot_name: string
          status: string
          tasks_completed?: number | null
          updated_at?: string
          uptime_hours?: number | null
        }
        Update: {
          battery_level?: number
          created_at?: string
          current_task?: string | null
          id?: string
          last_inspection?: string | null
          location?: string
          robot_name?: string
          status?: string
          tasks_completed?: number | null
          updated_at?: string
          uptime_hours?: number | null
        }
        Relationships: []
      }
      sensor_logs: {
        Row: {
          created_at: string
          id: string
          location: string
          recorded_at: string
          sensor_name: string
          sensor_type: string
          status: string
          unit: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          location: string
          recorded_at?: string
          sensor_name: string
          sensor_type: string
          status?: string
          unit: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          location?: string
          recorded_at?: string
          sensor_name?: string
          sensor_type?: string
          status?: string
          unit?: string
          value?: number
        }
        Relationships: []
      }
      shift_schedules: {
        Row: {
          created_at: string
          end_time: string
          id: string
          notes: string | null
          role: string | null
          shift_date: string
          start_time: string
          updated_at: string
          user_id: string
          zone: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          notes?: string | null
          role?: string | null
          shift_date: string
          start_time: string
          updated_at?: string
          user_id: string
          zone: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          notes?: string | null
          role?: string | null
          shift_date?: string
          start_time?: string
          updated_at?: string
          user_id?: string
          zone?: string
        }
        Relationships: []
      }
      sla_metrics: {
        Row: {
          created_at: string
          current_value: number
          id: string
          metric_name: string
          period_end: string
          period_start: string
          status: string
          target_value: number
          unit: string
        }
        Insert: {
          created_at?: string
          current_value: number
          id?: string
          metric_name: string
          period_end: string
          period_start: string
          status?: string
          target_value: number
          unit: string
        }
        Update: {
          created_at?: string
          current_value?: number
          id?: string
          metric_name?: string
          period_end?: string
          period_start?: string
          status?: string
          target_value?: number
          unit?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

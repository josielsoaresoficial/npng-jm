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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      calories_burned: {
        Row: {
          activity_type: string | null
          calories: number
          created_at: string | null
          date: string
          duration_minutes: number | null
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          activity_type?: string | null
          calories: number
          created_at?: string | null
          date?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string | null
          calories?: number
          created_at?: string | null
          date?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      custom_foods: {
        Row: {
          calories: number
          carbs: number
          category: string | null
          created_at: string | null
          fat: number
          id: string
          name: string
          notes: string | null
          portion: string
          protein: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calories: number
          carbs: number
          category?: string | null
          created_at?: string | null
          fat: number
          id?: string
          name: string
          notes?: string | null
          portion?: string
          protein: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number
          category?: string | null
          created_at?: string | null
          fat?: number
          id?: string
          name?: string
          notes?: string | null
          portion?: string
          protein?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      custom_workout_exercises: {
        Row: {
          created_at: string | null
          custom_workout_id: string
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          reps: string | null
          rest_time: number | null
          sets: number | null
        }
        Insert: {
          created_at?: string | null
          custom_workout_id: string
          exercise_id: string
          id?: string
          notes?: string | null
          order_index: number
          reps?: string | null
          rest_time?: number | null
          sets?: number | null
        }
        Update: {
          created_at?: string | null
          custom_workout_id?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          reps?: string | null
          rest_time?: number | null
          sets?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_workout_exercises_custom_workout_id_fkey"
            columns: ["custom_workout_id"]
            isOneToOne: false
            referencedRelation: "custom_workouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_library"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_workouts: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string
          is_favorite: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_favorite?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_favorite?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      diet_daily_plans: {
        Row: {
          created_at: string
          day_number: number
          diet_program_id: string
          fasting_hours: number
          id: string
          is_training_day: boolean
          is_weekend: boolean
          meals: Json
          tips: string[] | null
          week_number: number
        }
        Insert: {
          created_at?: string
          day_number: number
          diet_program_id: string
          fasting_hours?: number
          id?: string
          is_training_day?: boolean
          is_weekend?: boolean
          meals?: Json
          tips?: string[] | null
          week_number: number
        }
        Update: {
          created_at?: string
          day_number?: number
          diet_program_id?: string
          fasting_hours?: number
          id?: string
          is_training_day?: boolean
          is_weekend?: boolean
          meals?: Json
          tips?: string[] | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "diet_daily_plans_diet_program_id_fkey"
            columns: ["diet_program_id"]
            isOneToOne: false
            referencedRelation: "diet_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_programs: {
        Row: {
          created_at: string
          description: string | null
          duration_days: number
          id: string
          is_active: boolean
          name: string
          target_goal: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean
          name: string
          target_goal: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean
          name?: string
          target_goal?: string
          updated_at?: string
        }
        Relationships: []
      }
      diet_recipes: {
        Row: {
          category: string
          created_at: string
          diet_program_id: string
          id: string
          ingredients: Json
          instructions: string
          is_low_carb: boolean
          is_weekend_meal: boolean
          macros: Json
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          diet_program_id: string
          id?: string
          ingredients?: Json
          instructions: string
          is_low_carb?: boolean
          is_weekend_meal?: boolean
          macros?: Json
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          diet_program_id?: string
          id?: string
          ingredients?: Json
          instructions?: string
          is_low_carb?: boolean
          is_weekend_meal?: boolean
          macros?: Json
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "diet_recipes_diet_program_id_fkey"
            columns: ["diet_program_id"]
            isOneToOne: false
            referencedRelation: "diet_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_history: {
        Row: {
          completed_at: string | null
          created_at: string | null
          exercise_id: string | null
          id: string
          notes: string | null
          reps_completed: number | null
          sets_completed: number | null
          user_id: string
          weight_used: number | null
          workout_history_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          exercise_id?: string | null
          id?: string
          notes?: string | null
          reps_completed?: number | null
          sets_completed?: number | null
          user_id: string
          weight_used?: number | null
          workout_history_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          exercise_id?: string | null
          id?: string
          notes?: string | null
          reps_completed?: number | null
          sets_completed?: number | null
          user_id?: string
          weight_used?: number | null
          workout_history_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_history_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_history_workout_history_id_fkey"
            columns: ["workout_history_id"]
            isOneToOne: false
            referencedRelation: "workout_history"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_library: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string | null
          duration: string | null
          equipment: Json | null
          gif_url: string | null
          id: string
          instructions: Json | null
          muscle_group: string
          name: string
          reps: string | null
          rest_time: number | null
          sets: number | null
          subdivision: string | null
          tips: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration?: string | null
          equipment?: Json | null
          gif_url?: string | null
          id?: string
          instructions?: Json | null
          muscle_group: string
          name: string
          reps?: string | null
          rest_time?: number | null
          sets?: number | null
          subdivision?: string | null
          tips?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration?: string | null
          equipment?: Json | null
          gif_url?: string | null
          id?: string
          instructions?: Json | null
          muscle_group?: string
          name?: string
          reps?: string | null
          rest_time?: number | null
          sets?: number | null
          subdivision?: string | null
          tips?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      favorite_exercises: {
        Row: {
          created_at: string | null
          exercise_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          exercise_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          exercise_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_library"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_recipes: {
        Row: {
          category: string | null
          created_at: string
          id: string
          ingredients: Json
          instructions: string
          macros: Json | null
          notes: string | null
          prep_time: string | null
          servings: number | null
          tags: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          ingredients?: Json
          instructions: string
          macros?: Json | null
          notes?: string | null
          prep_time?: string | null
          servings?: number | null
          tags?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          ingredients?: Json
          instructions?: string
          macros?: Json | null
          notes?: string | null
          prep_time?: string | null
          servings?: number | null
          tags?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      hydration_logs: {
        Row: {
          amount_ml: number
          created_at: string
          id: string
          logged_at: string
          user_id: string
        }
        Insert: {
          amount_ml?: number
          created_at?: string
          id?: string
          logged_at?: string
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string
          id?: string
          logged_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meals: {
        Row: {
          confidence_score: number | null
          created_at: string
          foods: Json
          id: string
          image_url: string | null
          meal_name: string | null
          meal_type: string | null
          notes: string | null
          total_calories: number
          total_carbs: number
          total_fat: number
          total_protein: number
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          foods?: Json
          id?: string
          image_url?: string | null
          meal_name?: string | null
          meal_type?: string | null
          notes?: string | null
          total_calories?: number
          total_carbs?: number
          total_fat?: number
          total_protein?: number
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          foods?: Json
          id?: string
          image_url?: string | null
          meal_name?: string | null
          meal_type?: string | null
          notes?: string | null
          total_calories?: number
          total_carbs?: number
          total_fat?: number
          total_protein?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string
          daily_calories_burn_goal: number | null
          daily_calories_goal: number | null
          daily_carbs_goal: number | null
          daily_fat_goal: number | null
          daily_protein_goal: number | null
          fitness_goal: string | null
          gender: string | null
          goal_weight: number | null
          height: number | null
          id: string
          is_premium: boolean | null
          name: string | null
          onboarding_completed: boolean | null
          trial_expired: boolean | null
          trial_started_at: string | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          daily_calories_burn_goal?: number | null
          daily_calories_goal?: number | null
          daily_carbs_goal?: number | null
          daily_fat_goal?: number | null
          daily_protein_goal?: number | null
          fitness_goal?: string | null
          gender?: string | null
          goal_weight?: number | null
          height?: number | null
          id?: string
          is_premium?: boolean | null
          name?: string | null
          onboarding_completed?: boolean | null
          trial_expired?: boolean | null
          trial_started_at?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          daily_calories_burn_goal?: number | null
          daily_calories_goal?: number | null
          daily_carbs_goal?: number | null
          daily_fat_goal?: number | null
          daily_protein_goal?: number | null
          fitness_goal?: string | null
          gender?: string | null
          goal_weight?: number | null
          height?: number | null
          id?: string
          is_premium?: boolean | null
          name?: string | null
          onboarding_completed?: boolean | null
          trial_expired?: boolean | null
          trial_started_at?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_type: string
          id: string
          shared_count: number | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_type: string
          id?: string
          shared_count?: number | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_type?: string
          id?: string
          shared_count?: number | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_diet_enrollments: {
        Row: {
          created_at: string
          current_day: number
          diet_program_id: string
          id: string
          initial_weight: number | null
          started_at: string
          status: string
          target_weight_loss: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_day?: number
          diet_program_id: string
          id?: string
          initial_weight?: number | null
          started_at?: string
          status?: string
          target_weight_loss?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_day?: number
          diet_program_id?: string
          id?: string
          initial_weight?: number | null
          started_at?: string
          status?: string
          target_weight_loss?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_diet_enrollments_diet_program_id_fkey"
            columns: ["diet_program_id"]
            isOneToOne: false
            referencedRelation: "diet_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_history: {
        Row: {
          calories_burned: number | null
          completed_at: string | null
          created_at: string | null
          duration_minutes: number | null
          exercises_completed: Json | null
          id: string
          notes: string | null
          user_id: string
          workout_id: string | null
        }
        Insert: {
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          exercises_completed?: Json | null
          id?: string
          notes?: string | null
          user_id: string
          workout_id?: string | null
        }
        Update: {
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          exercises_completed?: Json | null
          id?: string
          notes?: string | null
          user_id?: string
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_history_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          difficulty: string
          duration_minutes: number
          estimated_calories: number
          exercises_data: Json | null
          id: string
          image_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          difficulty?: string
          duration_minutes?: number
          estimated_calories?: number
          exercises_data?: Json | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty?: string
          duration_minutes?: number
          estimated_calories?: number
          exercises_data?: Json | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_daily_nutrition: {
        Args: { p_date?: string; p_user_id: string }
        Returns: {
          meal_count: number
          total_calories: number
          total_carbs: number
          total_fat: number
          total_protein: number
        }[]
      }
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

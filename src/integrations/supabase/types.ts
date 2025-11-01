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
      app_analytics: {
        Row: {
          app_type: Database["public"]["Enums"]["app_type"]
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number | null
          recorded_at: string | null
          student_id: string | null
        }
        Insert: {
          app_type: Database["public"]["Enums"]["app_type"]
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value?: number | null
          recorded_at?: string | null
          student_id?: string | null
        }
        Update: {
          app_type?: Database["public"]["Enums"]["app_type"]
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number | null
          recorded_at?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_analytics_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_students: {
        Row: {
          classroom_id: string
          joined_at: string | null
          student_id: string
        }
        Insert: {
          classroom_id: string
          joined_at?: string | null
          student_id: string
        }
        Update: {
          classroom_id?: string
          joined_at?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_students_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      classrooms: {
        Row: {
          coach_id: string | null
          created_at: string | null
          grade_level: string | null
          id: string
          name: string
        }
        Insert: {
          coach_id?: string | null
          created_at?: string | null
          grade_level?: string | null
          id?: string
          name: string
        }
        Update: {
          coach_id?: string | null
          created_at?: string | null
          grade_level?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "classrooms_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "learning_coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          app_type: Database["public"]["Enums"]["app_type"]
          audio_urls: Json | null
          content_type: string
          created_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          grade_level: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          subtitle: string | null
          title: string
        }
        Insert: {
          app_type: Database["public"]["Enums"]["app_type"]
          audio_urls?: Json | null
          content_type: string
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          grade_level?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          subtitle?: string | null
          title: string
        }
        Update: {
          app_type?: Database["public"]["Enums"]["app_type"]
          audio_urls?: Json | null
          content_type?: string
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          grade_level?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      learning_coaches: {
        Row: {
          created_at: string | null
          id: string
          organization: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          organization?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_coaches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      multiplications_app_app_config: {
        Row: {
          created_at: string | null
          description: string | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      multiplications_app_daily_difficulty_metrics: {
        Row: {
          app_type: string
          attempted: number | null
          avg_time_seconds: number | null
          correct: number | null
          created_at: string | null
          difficulty_band: string
          id: string
          metric_date: string
          student_id: string | null
          time_spent_seconds: number | null
          updated_at: string | null
        }
        Insert: {
          app_type: string
          attempted?: number | null
          avg_time_seconds?: number | null
          correct?: number | null
          created_at?: string | null
          difficulty_band: string
          id?: string
          metric_date: string
          student_id?: string | null
          time_spent_seconds?: number | null
          updated_at?: string | null
        }
        Update: {
          app_type?: string
          attempted?: number | null
          avg_time_seconds?: number | null
          correct?: number | null
          created_at?: string | null
          difficulty_band?: string
          id?: string
          metric_date?: string
          student_id?: string | null
          time_spent_seconds?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      multiplications_app_daily_student_metrics: {
        Row: {
          app_type: string
          attempted: number | null
          avg_time_seconds: number | null
          correct: number | null
          created_at: string | null
          fast_count: number | null
          id: string
          medium_count: number | null
          metric_date: string
          slow_count: number | null
          student_id: string | null
          time_spent_seconds: number | null
          updated_at: string | null
        }
        Insert: {
          app_type: string
          attempted?: number | null
          avg_time_seconds?: number | null
          correct?: number | null
          created_at?: string | null
          fast_count?: number | null
          id?: string
          medium_count?: number | null
          metric_date: string
          slow_count?: number | null
          student_id?: string | null
          time_spent_seconds?: number | null
          updated_at?: string | null
        }
        Update: {
          app_type?: string
          attempted?: number | null
          avg_time_seconds?: number | null
          correct?: number | null
          created_at?: string | null
          fast_count?: number | null
          id?: string
          medium_count?: number | null
          metric_date?: string
          slow_count?: number | null
          student_id?: string | null
          time_spent_seconds?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      multiplications_app_learning_sessions: {
        Row: {
          accuracy: number | null
          app_type: Database["public"]["Enums"]["app_type"]
          average_time_per_question: number | null
          completed_at: string | null
          completed_items: number | null
          correct_answers: number | null
          created_at: string | null
          duration_seconds: number | null
          fast_answers_count: number | null
          id: string
          last_activity_at: string | null
          medium_answers_count: number | null
          metadata: Json | null
          session_name: string | null
          session_type: string
          slow_answers_count: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["session_status"] | null
          student_id: string | null
          total_items: number | null
          updated_at: string | null
        }
        Insert: {
          accuracy?: number | null
          app_type: Database["public"]["Enums"]["app_type"]
          average_time_per_question?: number | null
          completed_at?: string | null
          completed_items?: number | null
          correct_answers?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          fast_answers_count?: number | null
          id?: string
          last_activity_at?: string | null
          medium_answers_count?: number | null
          metadata?: Json | null
          session_name?: string | null
          session_type: string
          slow_answers_count?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"] | null
          student_id?: string | null
          total_items?: number | null
          updated_at?: string | null
        }
        Update: {
          accuracy?: number | null
          app_type?: Database["public"]["Enums"]["app_type"]
          average_time_per_question?: number | null
          completed_at?: string | null
          completed_items?: number | null
          correct_answers?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          fast_answers_count?: number | null
          id?: string
          last_activity_at?: string | null
          medium_answers_count?: number | null
          metadata?: Json | null
          session_name?: string | null
          session_type?: string
          slow_answers_count?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"] | null
          student_id?: string | null
          total_items?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      multiplications_app_math_grid_progress: {
        Row: {
          created_at: string | null
          grid_state: Json
          guardrails_level: string | null
          id: string
          student_id: string | null
          total_attempts: number | null
          total_correct_answers: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          grid_state: Json
          guardrails_level?: string | null
          id?: string
          student_id?: string | null
          total_attempts?: number | null
          total_correct_answers?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          grid_state?: Json
          guardrails_level?: string | null
          id?: string
          student_id?: string | null
          total_attempts?: number | null
          total_correct_answers?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      multiplications_app_question_attempts: {
        Row: {
          attempt_number: number
          correct_answer: number
          created_at: string | null
          id: string
          is_correct: boolean
          multiplicand: number
          multiplier: number
          session_id: string | null
          student_id: string | null
          time_classification: string
          time_spent_seconds: number
          user_answer: number
        }
        Insert: {
          attempt_number: number
          correct_answer: number
          created_at?: string | null
          id?: string
          is_correct: boolean
          multiplicand: number
          multiplier: number
          session_id?: string | null
          student_id?: string | null
          time_classification: string
          time_spent_seconds: number
          user_answer: number
        }
        Update: {
          attempt_number?: number
          correct_answer?: number
          created_at?: string | null
          id?: string
          is_correct?: boolean
          multiplicand?: number
          multiplier?: number
          session_id?: string | null
          student_id?: string | null
          time_classification?: string
          time_spent_seconds?: number
          user_answer?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_attempts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "multiplications_app_learning_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_progress: {
        Row: {
          attempts_count: number | null
          content_item_id: string | null
          created_at: string | null
          id: string
          is_correct: boolean | null
          presented_at: string | null
          session_id: string | null
          student_answer: string | null
          time_taken_seconds: number | null
        }
        Insert: {
          attempts_count?: number | null
          content_item_id?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          presented_at?: string | null
          session_id?: string | null
          student_answer?: string | null
          time_taken_seconds?: number | null
        }
        Update: {
          attempts_count?: number | null
          content_item_id?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          presented_at?: string | null
          session_id?: string | null
          student_answer?: string | null
          time_taken_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_progress_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_progress_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "multiplications_app_learning_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      spelling_app_daily_practice_sessions: {
        Row: {
          accuracy: number | null
          completed_at: string | null
          created_at: string | null
          day_of_week: Database["public"]["Enums"]["spelling_app_day"]
          duration_seconds: number | null
          id: string
          practice_type: string | null
          status:
            | Database["public"]["Enums"]["spelling_app_session_status"]
            | null
          updated_at: string | null
          weekly_session_id: string
          word_results: Json | null
          words_attempted: number | null
          words_correct: number | null
        }
        Insert: {
          accuracy?: number | null
          completed_at?: string | null
          created_at?: string | null
          day_of_week: Database["public"]["Enums"]["spelling_app_day"]
          duration_seconds?: number | null
          id?: string
          practice_type?: string | null
          status?:
            | Database["public"]["Enums"]["spelling_app_session_status"]
            | null
          updated_at?: string | null
          weekly_session_id: string
          word_results?: Json | null
          words_attempted?: number | null
          words_correct?: number | null
        }
        Update: {
          accuracy?: number | null
          completed_at?: string | null
          created_at?: string | null
          day_of_week?: Database["public"]["Enums"]["spelling_app_day"]
          duration_seconds?: number | null
          id?: string
          practice_type?: string | null
          status?:
            | Database["public"]["Enums"]["spelling_app_session_status"]
            | null
          updated_at?: string | null
          weekly_session_id?: string
          word_results?: Json | null
          words_attempted?: number | null
          words_correct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "spelling_app_daily_practice_sessions_weekly_session_id_fkey"
            columns: ["weekly_session_id"]
            isOneToOne: false
            referencedRelation: "spelling_app_weekly_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      spelling_app_daily_practice_word_results: {
        Row: {
          created_at: string | null
          daily_session_id: string
          id: string
          is_correct: boolean
          position: number
          time_taken_seconds: number
          user_answer: string
          word: string
          word_id: string | null
        }
        Insert: {
          created_at?: string | null
          daily_session_id: string
          id?: string
          is_correct?: boolean
          position: number
          time_taken_seconds?: number
          user_answer: string
          word: string
          word_id?: string | null
        }
        Update: {
          created_at?: string | null
          daily_session_id?: string
          id?: string
          is_correct?: boolean
          position?: number
          time_taken_seconds?: number
          user_answer?: string
          word?: string
          word_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spelling_app_daily_practice_word_results_daily_session_id_fkey"
            columns: ["daily_session_id"]
            isOneToOne: false
            referencedRelation: "spelling_app_daily_practice_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spelling_app_daily_practice_word_results_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "spelling_app_words"
            referencedColumns: ["id"]
          },
        ]
      }
      spelling_app_generation_config: {
        Row: {
          auto_generate_enabled: boolean | null
          created_at: string | null
          id: string
          last_generation_date: string | null
          notify_admins: boolean | null
          updated_at: string | null
          weeks_ahead: number | null
          words_per_list: number | null
        }
        Insert: {
          auto_generate_enabled?: boolean | null
          created_at?: string | null
          id?: string
          last_generation_date?: string | null
          notify_admins?: boolean | null
          updated_at?: string | null
          weeks_ahead?: number | null
          words_per_list?: number | null
        }
        Update: {
          auto_generate_enabled?: boolean | null
          created_at?: string | null
          id?: string
          last_generation_date?: string | null
          notify_admins?: boolean | null
          updated_at?: string | null
          weeks_ahead?: number | null
          words_per_list?: number | null
        }
        Relationships: []
      }
      spelling_app_generation_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          generation_date: string | null
          id: string
          lists_created: Json | null
          start_date: string
          status: string
          total_lists: number | null
          trigger_type: string
          triggered_by_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          generation_date?: string | null
          id?: string
          lists_created?: Json | null
          start_date: string
          status: string
          total_lists?: number | null
          trigger_type: string
          triggered_by_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          generation_date?: string | null
          id?: string
          lists_created?: Json | null
          start_date?: string
          status?: string
          total_lists?: number | null
          trigger_type?: string
          triggered_by_user_id?: string | null
        }
        Relationships: []
      }
      spelling_app_spelling_bee_results: {
        Row: {
          accuracy: number | null
          admin_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          student_id: string
          updated_at: string | null
          word_list_id: string
          word_results: Json | null
          words_attempted: number | null
          words_correct: number | null
        }
        Insert: {
          accuracy?: number | null
          admin_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          student_id: string
          updated_at?: string | null
          word_list_id: string
          word_results?: Json | null
          words_attempted?: number | null
          words_correct?: number | null
        }
        Update: {
          accuracy?: number | null
          admin_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          student_id?: string
          updated_at?: string | null
          word_list_id?: string
          word_results?: Json | null
          words_attempted?: number | null
          words_correct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "spelling_app_spelling_bee_results_word_list_id_fkey"
            columns: ["word_list_id"]
            isOneToOne: false
            referencedRelation: "spelling_app_word_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      spelling_app_spelling_bee_sessions: {
        Row: {
          accuracy: number | null
          admin_id: string
          completed_at: string | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          started_at: string | null
          student_id: string
          updated_at: string | null
          word_list_id: string
          word_results: Json | null
          words_attempted: number | null
          words_correct: number | null
        }
        Insert: {
          accuracy?: number | null
          admin_id: string
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          started_at?: string | null
          student_id: string
          updated_at?: string | null
          word_list_id: string
          word_results?: Json | null
          words_attempted?: number | null
          words_correct?: number | null
        }
        Update: {
          accuracy?: number | null
          admin_id?: string
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          started_at?: string | null
          student_id?: string
          updated_at?: string | null
          word_list_id?: string
          word_results?: Json | null
          words_attempted?: number | null
          words_correct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "spelling_app_spelling_bee_sessions_word_list_id_fkey"
            columns: ["word_list_id"]
            isOneToOne: false
            referencedRelation: "spelling_app_word_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      spelling_app_students: {
        Row: {
          created_at: string | null
          current_level: Database["public"]["Enums"]["spelling_app_level"]
          email: string
          id: string
          level_start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_level?: Database["public"]["Enums"]["spelling_app_level"]
          email: string
          id?: string
          level_start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_level?: Database["public"]["Enums"]["spelling_app_level"]
          email?: string
          id?: string
          level_start_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      spelling_app_user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["spelling_app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["spelling_app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["spelling_app_role"]
          user_id?: string
        }
        Relationships: []
      }
      spelling_app_verbal_challenge_results: {
        Row: {
          accuracy: number | null
          audio_recordings: Json | null
          completed_at: string | null
          created_at: string | null
          id: string
          student_id: string
          updated_at: string | null
          word_list_id: string
          word_results: Json | null
          words_attempted: number | null
          words_both_correct: number | null
          words_definition_correct: number | null
          words_spelling_correct: number | null
        }
        Insert: {
          accuracy?: number | null
          audio_recordings?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          student_id: string
          updated_at?: string | null
          word_list_id: string
          word_results?: Json | null
          words_attempted?: number | null
          words_both_correct?: number | null
          words_definition_correct?: number | null
          words_spelling_correct?: number | null
        }
        Update: {
          accuracy?: number | null
          audio_recordings?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          student_id?: string
          updated_at?: string | null
          word_list_id?: string
          word_results?: Json | null
          words_attempted?: number | null
          words_both_correct?: number | null
          words_definition_correct?: number | null
          words_spelling_correct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "spelling_app_verbal_challenge_results_word_list_id_fkey"
            columns: ["word_list_id"]
            isOneToOne: false
            referencedRelation: "spelling_app_word_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      spelling_app_verbal_challenge_sessions: {
        Row: {
          accuracy: number | null
          audio_recordings: Json | null
          completed_at: string | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          started_at: string | null
          status: string
          student_id: string
          updated_at: string | null
          word_list_id: string
          word_results: Json | null
          words_attempted: number | null
          words_both_correct: number | null
          words_definition_correct: number | null
          words_spelling_correct: number | null
        }
        Insert: {
          accuracy?: number | null
          audio_recordings?: Json | null
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          started_at?: string | null
          status?: string
          student_id: string
          updated_at?: string | null
          word_list_id: string
          word_results?: Json | null
          words_attempted?: number | null
          words_both_correct?: number | null
          words_definition_correct?: number | null
          words_spelling_correct?: number | null
        }
        Update: {
          accuracy?: number | null
          audio_recordings?: Json | null
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          started_at?: string | null
          status?: string
          student_id?: string
          updated_at?: string | null
          word_list_id?: string
          word_results?: Json | null
          words_attempted?: number | null
          words_both_correct?: number | null
          words_definition_correct?: number | null
          words_spelling_correct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "spelling_app_verbal_challenge_sessions_word_list_id_fkey"
            columns: ["word_list_id"]
            isOneToOne: false
            referencedRelation: "spelling_app_word_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      spelling_app_weekly_sessions: {
        Row: {
          created_at: string | null
          days_completed: number | null
          id: string
          started_at: string | null
          student_id: string
          total_attempts: number | null
          total_correct: number | null
          updated_at: string | null
          word_list_id: string
        }
        Insert: {
          created_at?: string | null
          days_completed?: number | null
          id?: string
          started_at?: string | null
          student_id: string
          total_attempts?: number | null
          total_correct?: number | null
          updated_at?: string | null
          word_list_id: string
        }
        Update: {
          created_at?: string | null
          days_completed?: number | null
          id?: string
          started_at?: string | null
          student_id?: string
          total_attempts?: number | null
          total_correct?: number | null
          updated_at?: string | null
          word_list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spelling_app_weekly_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "spelling_app_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spelling_app_weekly_sessions_word_list_id_fkey"
            columns: ["word_list_id"]
            isOneToOne: false
            referencedRelation: "spelling_app_word_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      spelling_app_word_list_words: {
        Row: {
          created_at: string | null
          id: string
          position: number
          word_id: string
          word_list_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          position: number
          word_id: string
          word_list_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          position?: number
          word_id?: string
          word_list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spelling_app_word_list_words_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "spelling_app_words"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spelling_app_word_list_words_word_list_id_fkey"
            columns: ["word_list_id"]
            isOneToOne: false
            referencedRelation: "spelling_app_word_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      spelling_app_word_lists: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          level: Database["public"]["Enums"]["spelling_app_level"]
          updated_at: string | null
          week_end_date: string
          week_number: number
          week_start_date: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          level: Database["public"]["Enums"]["spelling_app_level"]
          updated_at?: string | null
          week_end_date: string
          week_number: number
          week_start_date: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          level?: Database["public"]["Enums"]["spelling_app_level"]
          updated_at?: string | null
          week_end_date?: string
          week_number?: number
          week_start_date?: string
        }
        Relationships: []
      }
      spelling_app_words: {
        Row: {
          created_at: string | null
          definition: string | null
          definition_audio_url: string | null
          difficulty_score: number | null
          example_audio_url: string | null
          id: string
          is_active: boolean | null
          phonetic_spelling: string | null
          sample_sentence: string | null
          seconds_gap: number | null
          updated_at: string | null
          vocabulary_enabled: boolean | null
          vocabulary_mode: string | null
          word: string
          word_audio_url: string | null
          word_category: string | null
          wrong_definitions: Json | null
        }
        Insert: {
          created_at?: string | null
          definition?: string | null
          definition_audio_url?: string | null
          difficulty_score?: number | null
          example_audio_url?: string | null
          id?: string
          is_active?: boolean | null
          phonetic_spelling?: string | null
          sample_sentence?: string | null
          seconds_gap?: number | null
          updated_at?: string | null
          vocabulary_enabled?: boolean | null
          vocabulary_mode?: string | null
          word: string
          word_audio_url?: string | null
          word_category?: string | null
          wrong_definitions?: Json | null
        }
        Update: {
          created_at?: string | null
          definition?: string | null
          definition_audio_url?: string | null
          difficulty_score?: number | null
          example_audio_url?: string | null
          id?: string
          is_active?: boolean | null
          phonetic_spelling?: string | null
          sample_sentence?: string | null
          seconds_gap?: number | null
          updated_at?: string | null
          vocabulary_enabled?: boolean | null
          vocabulary_mode?: string | null
          word?: string
          word_audio_url?: string | null
          word_category?: string | null
          wrong_definitions?: Json | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          current_level:
            | Database["public"]["Enums"]["spelling_app_level"]
            | null
          display_name: string
          email: string
          grade_level: string | null
          id: string
          level_start_date: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_level?:
            | Database["public"]["Enums"]["spelling_app_level"]
            | null
          display_name: string
          email: string
          grade_level?: string | null
          id: string
          level_start_date?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_level?:
            | Database["public"]["Enums"]["spelling_app_level"]
            | null
          display_name?: string
          email?: string
          grade_level?: string | null
          id?: string
          level_start_date?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_test_user:
        | {
            Args: {
              user_email: string
              user_name?: string
              user_password: string
              user_role?: string
            }
            Returns: string
          }
        | {
            Args: { user_email: string; user_name?: string; user_role?: string }
            Returns: string
          }
      delete_test_users: { Args: never; Returns: number }
      get_active_sessions_for_student: {
        Args: { student_uuid: string }
        Returns: {
          completed_items: number
          id: string
          last_activity_at: string
          session_name: string
          session_type: string
          started_at: string
          total_items: number
        }[]
      }
      get_difficulty_band: {
        Args: { multiplicand: number; multiplier: number }
        Returns: string
      }
      get_user_role: { Args: { user_uuid: string }; Returns: string }
      get_user_roles: { Args: { user_uuid: string }; Returns: string[] }
      is_super_admin: { Args: { user_uuid: string }; Returns: boolean }
      mark_abandoned_sessions: { Args: never; Returns: undefined }
      reconcile_daily_metrics: {
        Args: { target_date: string }
        Returns: undefined
      }
      reconcile_date_range: {
        Args: { end_date: string; start_date: string }
        Returns: undefined
      }
      reconcile_previous_day: { Args: never; Returns: undefined }
      seed_test_users: {
        Args: never
        Returns: {
          email: string
          role: string
          user_id: string
        }[]
      }
      spelling_app_has_role: {
        Args: {
          _role: Database["public"]["Enums"]["spelling_app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_type: "spelling" | "geography" | "math"
      difficulty_level: "easy" | "medium" | "hard"
      guardrails_level: "none" | "1-5" | "1-9" | "1-12"
      session_status: "active" | "completed" | "abandoned"
      spelling_app_day: "Monday" | "Tuesday" | "Wednesday" | "Thursday"
      spelling_app_level: "L1" | "L2" | "L3" | "L4" | "L5"
      spelling_app_role: "admin" | "student"
      spelling_app_session_status: "in_progress" | "completed" | "abandoned"
      user_role: "student" | "learning_coach" | "admin"
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
    Enums: {
      app_type: ["spelling", "geography", "math"],
      difficulty_level: ["easy", "medium", "hard"],
      guardrails_level: ["none", "1-5", "1-9", "1-12"],
      session_status: ["active", "completed", "abandoned"],
      spelling_app_day: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      spelling_app_level: ["L1", "L2", "L3", "L4", "L5"],
      spelling_app_role: ["admin", "student"],
      spelling_app_session_status: ["in_progress", "completed", "abandoned"],
      user_role: ["student", "learning_coach", "admin"],
    },
  },
} as const

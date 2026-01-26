/**
 * TypeScript types for Supabase database schema
 * Generated to match our SQL schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: 'pending' | 'active' | 'completed' | 'avoided'
          priority: 'high' | 'medium' | 'low'
          focus_time: number
          scheduled_for: string | null
          created_at: string
          completed_at: string | null
          avoided_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: 'pending' | 'active' | 'completed' | 'avoided'
          priority?: 'high' | 'medium' | 'low'
          focus_time?: number
          scheduled_for?: string | null
          created_at?: string
          completed_at?: string | null
          avoided_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: 'pending' | 'active' | 'completed' | 'avoided'
          priority?: 'high' | 'medium' | 'low'
          focus_time?: number
          scheduled_for?: string | null
          created_at?: string
          completed_at?: string | null
          avoided_at?: string | null
          updated_at?: string
        }
      }
      focus_sessions: {
        Row: {
          id: string
          user_id: string
          task_id: string | null
          duration_seconds: number
          started_at: string
          ended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id?: string | null
          duration_seconds: number
          started_at: string
          ended_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string | null
          duration_seconds?: number
          started_at?: string
          ended_at?: string | null
          created_at?: string
        }
      }
      daily_summaries: {
        Row: {
          id: string
          user_id: string
          date: string
          focus_seconds: number
          tasks_completed: number
          tasks_avoided: number
          sessions_completed: number
          insight: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          focus_seconds?: number
          tasks_completed?: number
          tasks_avoided?: number
          sessions_completed?: number
          insight?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          focus_seconds?: number
          tasks_completed?: number
          tasks_avoided?: number
          sessions_completed?: number
          insight?: string | null
          created_at?: string
        }
      }
    }
  }
}

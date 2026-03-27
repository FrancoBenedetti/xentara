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
      hubs: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          slug: string
          owner_id: string | null
          settings: Json
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          slug: string
          owner_id?: string | null
          settings?: Json
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          slug?: string
          owner_id?: string | null
          settings?: Json
          is_active?: boolean
        }
      }
      boards: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          hub_id: string
          title: string
          description: string | null
          archetype: string
          config: Json
          is_public: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          hub_id: string
          title: string
          description?: string | null
          archetype?: string
          config?: Json
          is_public?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          hub_id?: string
          title?: string
          description?: string | null
          archetype?: string
          config?: Json
          is_public?: boolean
        }
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
  }
}

export type Hub = Database['public']['Tables']['hubs']['Row']
export type Board = Database['public']['Tables']['boards']['Row']

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
      monitored_sources: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          hub_id: string
          name: string
          type: 'youtube' | 'rss' | 'rumble' | 'twitter' | 'manual'
          url: string
          config: Json
          last_fetched_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          hub_id: string
          name: string
          type?: 'youtube' | 'rss' | 'rumble' | 'twitter' | 'manual'
          url: string
          config?: Json
          last_fetched_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          hub_id?: string
          name?: string
          type?: 'youtube' | 'rss' | 'rumble' | 'twitter' | 'manual'
          url?: string
          config?: Json
          last_fetched_at?: string | null
          is_active?: boolean
        }
      }
      publications: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          hub_id: string
          source_id: string | null
          title: string
          raw_content: string | null
          summary: string | null
          byline: string | null
          sentiment_score: number | null
          tags: string[] | null
          intelligence_metadata: Json
          status: 'raw' | 'transcribing' | 'summarizing' | 'ready' | 'failed'
          source_url: string | null
          published_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          hub_id: string
          source_id?: string | null
          title: string
          raw_content?: string | null
          summary?: string | null
          byline?: string | null
          sentiment_score?: number | null
          tags?: string[] | null
          intelligence_metadata?: Json
          status?: 'raw' | 'transcribing' | 'summarizing' | 'ready' | 'failed'
          source_url?: string | null
          published_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          hub_id?: string
          source_id?: string | null
          title?: string
          raw_content?: string | null
          summary?: string | null
          byline?: string | null
          sentiment_score?: number | null
          tags?: string[] | null
          intelligence_metadata?: Json
          status?: 'raw' | 'transcribing' | 'summarizing' | 'ready' | 'failed'
          source_url?: string | null
          published_at?: string | null
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
      source_type: 'youtube' | 'rss' | 'rumble' | 'twitter' | 'manual' | 'rsshub'
      publication_status: 'raw' | 'transcribing' | 'summarizing' | 'ready' | 'failed'
    }
  }
}

export type Hub = Database['public']['Tables']['hubs']['Row']
export type Board = Database['public']['Tables']['boards']['Row']
export type MonitoredSource = Database['public']['Tables']['monitored_sources']['Row']
export type Publication = Database['public']['Tables']['publications']['Row']

export interface RouteRequest {
  id: string
  created_at: string
  updated_at: string
  requested_by: string
  requested_by_hub_id: string | null
  target_url: string
  instructions: string | null
  access_notes: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'failed'
  rsshub_namespace: string | null
  rsshub_route_path: string | null
  rsshub_example_url: string | null
  resolution_notes: string | null
  resolved_at: string | null
  resolved_by: string | null
}

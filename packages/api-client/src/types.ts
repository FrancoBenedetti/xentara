/**
 * @xentara/api-client — Shared Types
 * Framework-agnostic. Safe to use in both browser and server environments.
 */

export interface Hub {
  id: string;
  name: string;
  slug: string;
  brand_color?: string;
  logo_url?: string;
  strictness?: 'exploratory' | 'strict';
}

export interface Publication {
  id: string;
  hub_id: string;
  title: string;
  byline: string;
  summary: string;
  curator_commentary?: string;
  tags: string[];
  sentiment_score?: number | null;
  source_url: string;
  published_at?: string;
  curator_published_at?: string;
  monitored_sources?: {
    name: string;
  };
}

export interface FeedResponse {
  publications: Publication[];
  page: number;
  hasMore: boolean;
}

export interface ApiError {
  error: string;
  status: number;
}

// ── Phase 7: Consumer Identity & Linking ──

export interface ConsumerProfile {
  id: string;
  display_alias?: string;
  avatar_hash?: string;
  is_anonymous: boolean;
  preferences: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface HubSubscription {
  id: string;
  hub_id: string;
  hub?: Hub;
  notification_preference: 'all' | 'highlights' | 'none';
  subscribed_at: string;
}

export interface MessengerIdentity {
  id: string;
  platform: 'telegram' | 'whatsapp';
  platform_username?: string;
  is_verified: boolean;
  linked_at?: string;
  created_at?: string;
}

export interface LinkTokenResponse {
  token: string;
  expires_at: string;
  platform: 'telegram' | 'whatsapp';
}

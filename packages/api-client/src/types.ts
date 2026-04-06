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

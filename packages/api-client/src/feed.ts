import type { Publication, FeedResponse } from './types';

/**
 * Fetches the published intelligence feed for a given hub slug.
 * @param apiBase - Base URL of the Xentara dashboard API (e.g. https://xentara.app or http://localhost:3000)
 * @param slug    - The hub's slug identifier
 * @param page    - Zero-based page number for pagination
 */
export async function getPublishedFeed(
  apiBase: string,
  slug: string,
  page = 0
): Promise<FeedResponse> {
  const res = await fetch(`${apiBase}/api/v1/hubs/${slug}/feed?page=${page}`, {
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch feed for "${slug}": ${res.status}`);
  }

  return res.json() as Promise<FeedResponse>;
}

export type { Publication };

import type { Hub } from './types';

/**
 * Fetches all public hubs from the Xentara API.
 */
export async function getPublicHubs(apiBase: string): Promise<Hub[]> {
  const res = await fetch(`${apiBase}/api/v1/hubs`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch hubs: ${res.status}`);
  }

  const data = await res.json();
  return data.hubs ?? [];
}

/**
 * Fetches a single hub by its slug.
 */
export async function getHubBySlug(apiBase: string, slug: string): Promise<Hub | null> {
  const res = await fetch(`${apiBase}/api/v1/hubs/${slug}`, {
    next: { revalidate: 60 },
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(`Failed to fetch hub "${slug}": ${res.status}`);
  }

  const data = await res.json();
  return data.hub ?? null;
}

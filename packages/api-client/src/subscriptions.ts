import type { HubSubscription } from './types';

/**
 * Subscribe the current user to a hub.
 */
export async function subscribeToHub(
  apiBase: string,
  authToken: string,
  slug: string
): Promise<HubSubscription> {
  const res = await fetch(`${apiBase}/api/v1/hubs/${slug}/subscribe`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${authToken}` },
  });

  if (res.status === 409) throw new Error('Already subscribed');
  if (!res.ok) throw new Error(`Failed to subscribe: ${res.status}`);

  const data = await res.json();
  return data.subscription;
}

/**
 * Unsubscribe the current user from a hub.
 */
export async function unsubscribeFromHub(
  apiBase: string,
  authToken: string,
  slug: string
): Promise<void> {
  const res = await fetch(`${apiBase}/api/v1/hubs/${slug}/subscribe`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${authToken}` },
  });

  if (!res.ok) throw new Error(`Failed to unsubscribe: ${res.status}`);
}

/**
 * Gets the anonymized subscriber count for a hub.
 * This is a public endpoint — no auth required.
 */
export async function getSubscriberCount(
  apiBase: string,
  slug: string
): Promise<number> {
  const res = await fetch(`${apiBase}/api/v1/hubs/${slug}/subscribers`, {
    next: { revalidate: 60 },
  } as RequestInit);

  if (!res.ok) return 0;
  const data = await res.json();
  return data.count ?? 0;
}

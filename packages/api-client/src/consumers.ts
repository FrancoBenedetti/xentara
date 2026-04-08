import type { ConsumerProfile } from './types';

/**
 * Fetches the current consumer's profile.
 * Lazy-creates a consumer_profiles row if one doesn't exist yet.
 */
export async function getMyProfile(
  apiBase: string,
  authToken: string
): Promise<ConsumerProfile> {
  const res = await fetch(`${apiBase}/api/v1/consumers/me`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
  const data = await res.json();
  return data.profile;
}

/**
 * Updates the current consumer's profile.
 */
export async function updateMyProfile(
  apiBase: string,
  authToken: string,
  updates: Partial<Pick<ConsumerProfile, 'display_alias' | 'is_anonymous' | 'preferences'>>
): Promise<ConsumerProfile> {
  const res = await fetch(`${apiBase}/api/v1/consumers/me`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) throw new Error(`Failed to update profile: ${res.status}`);
  const data = await res.json();
  return data.profile;
}

/**
 * Lists all hubs the current user is subscribed to.
 */
export async function getMySubscriptions(
  apiBase: string,
  authToken: string
) {
  const res = await fetch(`${apiBase}/api/v1/consumers/me/subscriptions`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  if (!res.ok) throw new Error(`Failed to fetch subscriptions: ${res.status}`);
  const data = await res.json();
  return data.subscriptions;
}

/**
 * Lists all messenger identities linked to the current user.
 */
export async function getMyIdentities(
  apiBase: string,
  authToken: string
) {
  const res = await fetch(`${apiBase}/api/v1/consumers/me/identities`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  if (!res.ok) throw new Error(`Failed to fetch identities: ${res.status}`);
  const data = await res.json();
  return data.identities;
}

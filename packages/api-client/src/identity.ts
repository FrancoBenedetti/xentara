import type { LinkTokenResponse, MessengerIdentity } from './types';

/**
 * Initiates identity linking by generating a 6-digit code.
 * The user provides this code to the bot on the target platform.
 */
export async function initiateLink(
  apiBase: string,
  authToken: string,
  platform: 'telegram' | 'whatsapp',
  platformUserId: string,
  platformUsername?: string
): Promise<LinkTokenResponse> {
  const res = await fetch(`${apiBase}/api/v1/identity/link`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      platform,
      platform_user_id: platformUserId,
      platform_username: platformUsername,
    }),
  });

  if (res.status === 409) throw new Error('This account is already linked to another user.');
  if (!res.ok) throw new Error(`Failed to initiate link: ${res.status}`);

  return res.json();
}

/**
 * Claims a link token using the 6-digit code.
 * This completes the identity hydration — the messenger identity
 * becomes linked to the authenticated user's account.
 */
export async function claimLink(
  apiBase: string,
  authToken: string,
  code: string
): Promise<MessengerIdentity> {
  const res = await fetch(`${apiBase}/api/v1/identity/claim`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: code }),
  });

  if (res.status === 409) throw new Error('Token already claimed.');
  if (res.status === 410) throw new Error('Token has expired.');
  if (res.status === 404) throw new Error('Invalid token.');
  if (!res.ok) throw new Error(`Failed to claim link: ${res.status}`);

  const data = await res.json();
  return data.identity;
}

/**
 * Unlinks a messenger identity from the current user's account.
 */
export async function unlinkIdentity(
  apiBase: string,
  authToken: string,
  identityId: string
): Promise<void> {
  const res = await fetch(`${apiBase}/api/v1/identity/${identityId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${authToken}` },
  });

  if (!res.ok) throw new Error(`Failed to unlink identity: ${res.status}`);
}

// ThinkPost AI — Session Helpers
// Convenience wrappers around WorkOS AuthKit session management.

import { getSignInUrl, getSignUpUrl, signOut, withAuth } from '@workos-inc/authkit-nextjs';

/**
 * Gets the current session info (if any).
 * Returns null if not authenticated (does NOT throw).
 */
export async function getCurrentSession() {
  try {
    const session = await withAuth();
    return session.user ? session : null;
  } catch {
    return null;
  }
}

/**
 * Gets session info or throws if not authenticated.
 */
export async function requireSession() {
  return withAuth({ ensureSignedIn: true });
}

export { getSignInUrl, getSignUpUrl, signOut };

// ThinkPost AI — Auth Callback Route
// Handles the WorkOS AuthKit OAuth callback after login/signup.
// FRD FR-A1: User record auto-created on first successful authentication.

import { handleAuth } from '@workos-inc/authkit-nextjs';

export const GET = handleAuth();

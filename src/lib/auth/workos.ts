// ThinkPost AI — WorkOS AuthKit Client
// Matches FRD Module A

import { WorkOS } from '@workos-inc/node';

// Ensure the API key is present
const workosApiKey = process.env.WORKOS_API_KEY;

if (!workosApiKey) {
  console.warn('WORKOS_API_KEY is not set. Auth operations will fail.');
}

// Initialize the WorkOS client
export const workos = new WorkOS(workosApiKey);

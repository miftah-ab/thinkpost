// ThinkPost AI — Supabase Client
// Server-side only. Uses service role key (no RLS — FRD Section 5 Access Model Decision).
// Authorization enforced in application code: every query scoped by user_id.
//
// CRITICAL: This module must NEVER be imported from client-side code.
// The service role key bypasses all Supabase security policies.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

/**
 * Server-side Supabase client using the service role key.
 * No RLS — all authorization handled in application code.
 * Every query MUST be scoped by user_id.
 */
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ThinkPost AI — Profile Repository
// Persistence layer for the profile table.
// Every query scoped by user_id.

import { supabase } from './supabase';
import type { Profile } from '@/lib/types';

/**
 * Get profile by user_id.
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

/**
 * Upsert profile fields. Uses ON CONFLICT on user_id (PK).
 */
export async function upsertProfile(
  userId: string,
  fields: Partial<Omit<Profile, 'user_id' | 'updated_at'>>
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profile')
    .upsert(
      { user_id: userId, ...fields },
      { onConflict: 'user_id' }
    )
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

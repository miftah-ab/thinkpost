// ThinkPost AI — Users Repository
// Persistence layer for the users table.
// Every query scoped by user_id (FRD Section 5 Access Model).

import { supabase } from './supabase';
import type { User } from '@/lib/types';

/**
 * Find user by WorkOS user ID.
 */
export async function getUserByWorkosId(workosUserId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('workos_user_id', workosUserId)
    .single();

  if (error && error.code === 'PGRST116') return null; // Not found
  if (error) throw error;
  return data;
}

/**
 * Find user by internal ID.
 */
export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

/**
 * Get the read_only_mode setting for a user.
 */
export async function getReadOnlyMode(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('read_only_mode')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data.read_only_mode;
}

/**
 * Set the read_only_mode setting for a user.
 */
export async function setReadOnlyMode(userId: string, enabled: boolean): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ read_only_mode: enabled })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Delete a user. CASCADE handles all related data (profile, writing_style, memories, posts).
 * FRD: Immediate, no grace period (Section 8).
 */
export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) throw error;
}

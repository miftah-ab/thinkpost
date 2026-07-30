// ThinkPost AI — Writing Style Repository
// Persistence layer for the writing_style table.

import { supabase } from './supabase';
import type { WritingStyle } from '@/lib/types';

/**
 * Get writing style by user_id.
 */
export async function getWritingStyle(userId: string): Promise<WritingStyle | null> {
  const { data, error } = await supabase
    .from('writing_style')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

/**
 * Upsert writing style. Uses ON CONFLICT on user_id (PK).
 */
export async function upsertWritingStyle(
  userId: string,
  fields: Omit<WritingStyle, 'user_id' | 'updated_at'>
): Promise<WritingStyle> {
  const { data, error } = await supabase
    .from('writing_style')
    .upsert(
      { user_id: userId, ...fields },
      { onConflict: 'user_id' }
    )
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

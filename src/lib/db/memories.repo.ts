// ThinkPost AI — Memories Repository
// Persistence layer for the memories table.

import { supabase } from './supabase';
import type { Memory, MemoryCategory } from '@/lib/types';

/**
 * Get memories for a user, optionally filtered by category.
 * Orders by created_at DESC.
 */
export async function getMemories(
  userId: string,
  category?: MemoryCategory
): Promise<Memory[]> {
  let query = supabase
    .from('memories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/**
 * Get memories capped at a limit (for get_post_context).
 * Orders by created_at DESC (recency = relevance for v1).
 */
export async function getRecentMemories(
  userId: string,
  limit: number = 15,
  category?: MemoryCategory
): Promise<Memory[]> {
  let query = supabase
    .from('memories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/**
 * Create a new memory.
 */
export async function createMemory(
  userId: string,
  fields: { key: string; value: string; category: MemoryCategory }
): Promise<Memory> {
  const { data, error } = await supabase
    .from('memories')
    .insert({
      user_id: userId,
      key: fields.key,
      value: fields.value,
      category: fields.category,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a memory by ID, scoped to user_id.
 * Returns true if deleted, false if not found.
 */
export async function deleteMemory(userId: string, memoryId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('memories')
    .delete()
    .eq('id', memoryId)
    .eq('user_id', userId)
    .select('id')
    .single();

  if (error && error.code === 'PGRST116') return false; // Not found
  if (error) throw error;
  return !!data;
}

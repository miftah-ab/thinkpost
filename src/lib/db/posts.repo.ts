// ThinkPost AI — Posts Repository
// Persistence layer for the posts table.

import { supabase } from './supabase';
import type { Post, PostStatus } from '@/lib/types';

/**
 * Get paginated posts for a user, with optional status filter and sort.
 */
export async function getPosts(
  userId: string,
  options: {
    page: number;
    pageSize: number;
    sortBy: 'created_at' | 'updated_at';
    status?: PostStatus;
  }
): Promise<{ data: Post[]; total: number }> {
  const { page, pageSize, sortBy, status } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order(sortBy, { ascending: false })
    .range(from, to);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], total: count ?? 0 };
}

/**
 * Get a single post by ID, scoped to user_id.
 */
export async function getPost(userId: string, postId: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

/**
 * Create a new post.
 */
export async function createPost(
  userId: string,
  fields: { title: string; content: string; status: PostStatus }
): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      title: fields.title,
      content: fields.content,
      status: fields.status,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a post (content and/or status).
 */
export async function updatePost(
  userId: string,
  postId: string,
  fields: Partial<{ title: string; content: string; status: PostStatus }>
): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .update(fields)
    .eq('id', postId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

/**
 * Soft-delete: set status to 'archived'.
 */
export async function archivePost(userId: string, postId: string): Promise<Post | null> {
  return updatePost(userId, postId, { status: 'archived' });
}

/**
 * Hard-delete a post. Only allowed if status is already 'archived'.
 * Returns true if deleted, false if not found.
 */
export async function permanentDeletePost(userId: string, postId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', userId)
    .eq('status', 'archived') // Only archived posts can be permanently deleted
    .select('id')
    .single();

  if (error && error.code === 'PGRST116') return false;
  if (error) throw error;
  return !!data;
}

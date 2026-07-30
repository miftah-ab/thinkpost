// ThinkPost AI — Posts Validation Schema
// Matches FRD Section 3, Module C (FR-C2, FR-C3)
// Updated for Zod v4 API

import { z } from 'zod';
import { POST_STATUSES } from '@/lib/types';

/**
 * Create post schema.
 */
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Post title is required.')
    .max(255, 'Post title must be 255 characters or fewer.'),
  content: z
    .string()
    .min(1, 'Post content is required.'),
  status: z
    .enum(POST_STATUSES, {
      error: 'Status must be one of: draft, published, archived.',
    })
    .default('draft'),
});

/**
 * Update post schema — all fields optional (partial update).
 */
export const updatePostSchema = z.object({
  title: z
    .string()
    .min(1, 'Post title is required.')
    .max(255, 'Post title must be 255 characters or fewer.')
    .optional(),
  content: z
    .string()
    .min(1, 'Post content is required.')
    .optional(),
  status: z
    .enum(POST_STATUSES, {
      error: 'Status must be one of: draft, published, archived.',
    })
    .optional(),
});

/**
 * Query params schema for GET /api/posts (pagination + sorting).
 * Zod v4: .default() on transformed values needs the output type.
 */
export const getPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1.').default(1),
  pageSize: z.coerce.number().int().min(1).max(100, 'Page size must be 100 or fewer.').default(10),
  sortBy: z
    .enum(['created_at', 'updated_at'] as const, {
      error: 'Sort must be by created_at or updated_at.',
    })
    .default('created_at'),
  status: z
    .enum(POST_STATUSES, {
      error: 'Invalid status filter.',
    })
    .optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type GetPostsQuery = z.infer<typeof getPostsQuerySchema>;

// ThinkPost AI — Memories Validation Schema
// Matches FRD Section 3, Module B (FR-B4)
// Updated for Zod v4 API

import { z } from 'zod';
import { MEMORY_CATEGORIES } from '@/lib/types';

/**
 * Create memory schema.
 */
export const createMemorySchema = z.object({
  key: z
    .string()
    .min(1, 'Memory key is required.')
    .max(100, 'Memory key must be 100 characters or fewer.'),
  value: z
    .string()
    .min(1, 'Memory value is required.'),
  category: z
    .enum(MEMORY_CATEGORIES, {
      error: 'Category must be one of: topic, fact, tone_note, experience_detail, other.',
    })
    .default('other'),
});

/**
 * Query params schema for GET /api/memories (optional category filter).
 */
export const getMemoriesQuerySchema = z.object({
  category: z
    .enum(MEMORY_CATEGORIES, {
      error: 'Invalid category filter.',
    })
    .optional(),
});

export type CreateMemoryInput = z.infer<typeof createMemorySchema>;
export type GetMemoriesQuery = z.infer<typeof getMemoriesQuerySchema>;

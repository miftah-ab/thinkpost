// ThinkPost AI — Memories Service
// Business logic for memory management.

import * as memoriesRepo from '@/lib/db/memories.repo';
import { createMemorySchema, type CreateMemoryInput } from '@/lib/validation/memories.schema';
import { sanitizeString } from '@/lib/sanitize';
import { notFoundError, serverError } from '@/lib/errors/app-error';
import type { Memory, MemoryCategory } from '@/lib/types';

/**
 * Get memories for a user, optionally filtered by category.
 */
export async function getMemories(
  userId: string,
  category?: MemoryCategory
): Promise<Memory[]> {
  try {
    return await memoriesRepo.getMemories(userId, category);
  } catch (error) {
    throw serverError(error);
  }
}

/**
 * Get recent memories capped at 15 (for get_post_context).
 */
export async function getRecentMemories(
  userId: string,
  limit: number = 15,
  category?: MemoryCategory
): Promise<Memory[]> {
  try {
    return await memoriesRepo.getRecentMemories(userId, limit, category);
  } catch (error) {
    throw serverError(error);
  }
}

/**
 * Create a new memory. Validates with Zod, sanitizes strings.
 */
export async function createMemory(
  userId: string,
  input: CreateMemoryInput
): Promise<Memory> {
  // Validate
  const validated = createMemorySchema.parse(input);

  // Sanitize string fields (FR-B2)
  const sanitized = {
    key: sanitizeString(validated.key),
    value: sanitizeString(validated.value),
    category: validated.category,
  };

  try {
    return await memoriesRepo.createMemory(userId, sanitized);
  } catch (error) {
    throw serverError(error);
  }
}

/**
 * Delete a memory by ID. Returns NOT_FOUND if the memory doesn't exist for this user.
 */
export async function deleteMemory(userId: string, memoryId: string): Promise<void> {
  try {
    const deleted = await memoriesRepo.deleteMemory(userId, memoryId);
    if (!deleted) {
      throw notFoundError("We couldn't find that memory. It may have been deleted.");
    }
  } catch (error) {
    if (error instanceof Error && error.constructor.name === 'AppError') throw error;
    throw serverError(error);
  }
}

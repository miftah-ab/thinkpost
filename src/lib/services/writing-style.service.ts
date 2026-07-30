// ThinkPost AI — Writing Style Service
// Business logic for writing style management.

import * as writingStyleRepo from '@/lib/db/writing-style.repo';
import { updateWritingStyleSchema, type UpdateWritingStyleInput } from '@/lib/validation/writing-style.schema';
import { sanitizeString } from '@/lib/sanitize';
import { serverError } from '@/lib/errors/app-error';
import type { WritingStyle } from '@/lib/types';

/**
 * Get writing style for a user.
 */
export async function getWritingStyle(userId: string): Promise<WritingStyle | null> {
  try {
    return await writingStyleRepo.getWritingStyle(userId);
  } catch (error) {
    throw serverError(error);
  }
}

/**
 * Update writing style. Validates with Zod, sanitizes cta_style.
 */
export async function updateWritingStyle(
  userId: string,
  input: UpdateWritingStyleInput
): Promise<WritingStyle> {
  // Validate
  const validated = updateWritingStyleSchema.parse(input);

  // Sanitize string fields
  const sanitized = {
    tone: validated.tone,
    length: validated.length,
    emoji_usage: validated.emoji_usage,
    cta_style: validated.cta_style ? sanitizeString(validated.cta_style) : null,
  };

  try {
    return await writingStyleRepo.upsertWritingStyle(userId, sanitized);
  } catch (error) {
    throw serverError(error);
  }
}

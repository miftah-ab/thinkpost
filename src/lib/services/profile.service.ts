// ThinkPost AI — Profile Service
// Business logic for profile management. Shared by REST and MCP.

import * as profileRepo from '@/lib/db/profile.repo';
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validation/profile.schema';
import { sanitizeString, sanitizeExperienceArray } from '@/lib/sanitize';
import { serverError } from '@/lib/errors/app-error';
import type { ProfileWithCompleteness } from '@/lib/types';

/**
 * Get profile with computed isProfileComplete flag.
 * isProfileComplete = true when headline AND bio are both non-empty (FR-B1).
 */
export async function getProfile(userId: string): Promise<ProfileWithCompleteness> {
  try {
    const profile = await profileRepo.getProfile(userId);

    if (!profile) {
      // Return empty profile with incomplete flag
      return {
        user_id: userId,
        headline: null,
        bio: null,
        experience: null,
        skills: null,
        goals: null,
        updated_at: new Date().toISOString(),
        isProfileComplete: false,
      };
    }

    return {
      ...profile,
      isProfileComplete: Boolean(
        profile.headline && profile.headline.trim().length > 0 &&
        profile.bio && profile.bio.trim().length > 0
      ),
    };
  } catch (error) {
    throw serverError(error);
  }
}

/**
 * Update profile fields. Validates with Zod, sanitizes all strings.
 */
export async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<ProfileWithCompleteness> {
  // Validate
  const validated = updateProfileSchema.parse(input);

  // Sanitize all string fields (FR-B2)
  const sanitized: Partial<Record<string, unknown>> = {};

  if (validated.headline !== undefined) {
    sanitized.headline = sanitizeString(validated.headline);
  }
  if (validated.bio !== undefined) {
    sanitized.bio = sanitizeString(validated.bio);
  }
  if (validated.experience !== undefined) {
    sanitized.experience = sanitizeExperienceArray(validated.experience);
  }
  if (validated.skills !== undefined) {
    sanitized.skills = validated.skills.map(sanitizeString);
  }
  if (validated.goals !== undefined) {
    sanitized.goals = validated.goals.map(sanitizeString);
  }

  try {
    const updated = await profileRepo.upsertProfile(userId, sanitized);

    return {
      ...updated,
      isProfileComplete: Boolean(
        updated.headline && updated.headline.trim().length > 0 &&
        updated.bio && updated.bio.trim().length > 0
      ),
    };
  } catch (error) {
    throw serverError(error);
  }
}

// ThinkPost AI — Profile Validation Schema
// Matches FRD Section 3, Module B (FR-B1, FR-B2)
//
// FLAGGED DEVIATION: bio has a hard API ceiling of 5,000 chars as an abuse/payload guard.
// The FRD specifies UI-only soft cap at 2,000 chars. The 5,000 hard ceiling is purely
// a safety net — not a UX rule.

import { z } from 'zod';

/**
 * Single experience entry within the experience array.
 */
export const experienceSchema = z.object({
  title: z.string().min(1, 'Job title is required.'),
  company: z.string().min(1, 'Company name is required.'),
  startDate: z.string().min(1, 'Start date is required.'),
  endDate: z.string().nullable(),
  description: z.string().default(''),
});

/**
 * Profile update schema — all fields optional (partial update).
 * Validated at both REST and MCP boundaries.
 */
export const updateProfileSchema = z.object({
  headline: z
    .string()
    .max(150, 'Headline must be 150 characters or fewer.')
    .optional(),
  bio: z
    .string()
    .max(5000, 'Bio exceeds the maximum allowed length.')
    .optional(),
  experience: z
    .array(experienceSchema)
    .optional(),
  skills: z
    .array(z.string().min(1, 'Skill cannot be empty.'))
    .optional(),
  goals: z
    .array(z.string().min(1, 'Goal cannot be empty.'))
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ThinkPost AI — Writing Style Validation Schema
// Matches FRD Section 3, Module B (FR-B3)
// Updated for Zod v4 API

import { z } from 'zod';
import { TONES, LENGTHS } from '@/lib/types';

/**
 * Writing style update schema.
 * All fields required per FRD — tone, length, emoji_usage are mandatory.
 */
export const updateWritingStyleSchema = z.object({
  tone: z.enum(TONES, {
    error: 'Tone must be one of: professional, casual, bold, thought-leader, storytelling.',
  }),
  length: z.enum(LENGTHS, {
    error: 'Length must be one of: short, medium, long.',
  }),
  emoji_usage: z.boolean({
    error: 'Emoji usage must be true or false.',
  }),
  cta_style: z
    .string()
    .max(500, 'CTA style must be 500 characters or fewer.')
    .nullable()
    .optional(),
});

export type UpdateWritingStyleInput = z.infer<typeof updateWritingStyleSchema>;

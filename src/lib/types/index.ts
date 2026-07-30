// ThinkPost AI — Core TypeScript Types
// Matches FRD Section 5 Data Dictionary exactly

// ============================================
// Enum Types
// ============================================

export const MEMORY_CATEGORIES = ['topic', 'fact', 'tone_note', 'experience_detail', 'other'] as const;
export type MemoryCategory = typeof MEMORY_CATEGORIES[number];

export const POST_STATUSES = ['draft', 'published', 'archived'] as const;
export type PostStatus = typeof POST_STATUSES[number];

export const TONES = ['professional', 'casual', 'bold', 'thought-leader', 'storytelling'] as const;
export type Tone = typeof TONES[number];

export const LENGTHS = ['short', 'medium', 'long'] as const;
export type Length = typeof LENGTHS[number];

// ============================================
// Sub-Types
// ============================================

export interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
}

// ============================================
// Database Row Types
// ============================================

export interface User {
  id: string; // UUID
  workos_user_id: string;
  email: string;
  name: string;
  read_only_mode: boolean;
  created_at: string; // ISO timestamp
}

export interface Profile {
  user_id: string; // UUID, PK, FK → users.id
  headline: string | null;
  bio: string | null;
  experience: Experience[] | null;
  skills: string[] | null;
  goals: string[] | null;
  updated_at: string; // ISO timestamp
}

export interface ProfileWithCompleteness extends Profile {
  isProfileComplete: boolean;
}

export interface WritingStyle {
  user_id: string; // UUID, PK, FK → users.id
  tone: Tone;
  length: Length;
  emoji_usage: boolean;
  cta_style: string | null;
  updated_at: string; // ISO timestamp
}

export interface Memory {
  id: string; // UUID
  user_id: string; // UUID, FK → users.id
  key: string;
  value: string;
  category: MemoryCategory;
  created_at: string; // ISO timestamp
}

export interface Post {
  id: string; // UUID
  user_id: string; // UUID, FK → users.id
  title: string;
  content: string;
  status: PostStatus;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// ============================================
// API Response Types
// ============================================

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    field?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// Post Context Bundle (get_post_context)
// ============================================

export interface PostContext {
  profile: {
    headline: string | null;
    bio: string | null;
    experience: Experience[] | null;
    skills: string[] | null;
    goals: string[] | null;
  };
  writingStyle: {
    tone: Tone;
    length: Length;
    emoji_usage: boolean;
    cta_style: string | null;
  };
  memories: Array<{
    id: string;
    key: string;
    value: string;
    category: MemoryCategory;
    created_at: string;
  }>;
  isProfileComplete: boolean;
}

// ============================================
// Status Transition Rules (FRD Section C3)
// ============================================

/**
 * Valid status transitions:
 *   draft → published ✓
 *   draft → archived ✓
 *   published → archived ✓
 *   archived → draft ✗ (create a new draft instead)
 *   archived → published ✗
 *   published → draft ✗
 */
export const VALID_STATUS_TRANSITIONS: Record<PostStatus, PostStatus[]> = {
  draft: ['published', 'archived'],
  published: ['archived'],
  archived: [],
};

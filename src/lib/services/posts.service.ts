// ThinkPost AI — Posts Service
// Business logic for post management.

import * as postsRepo from '@/lib/db/posts.repo';
import {
  createPostSchema,
  updatePostSchema,
  type CreatePostInput,
  type UpdatePostInput,
} from '@/lib/validation/posts.schema';
import { sanitizeString } from '@/lib/sanitize';
import {
  AppError,
  notFoundError,
  validationError,
  serverError,
} from '@/lib/errors/app-error';
import type { Post, PostStatus, PaginatedResponse } from '@/lib/types';
import { VALID_STATUS_TRANSITIONS } from '@/lib/types';

/**
 * Get paginated posts.
 */
export async function getPosts(
  userId: string,
  options: {
    page: number;
    pageSize: number;
    sortBy: 'created_at' | 'updated_at';
    status?: PostStatus;
  }
): Promise<PaginatedResponse<Post>> {
  try {
    const { data, total } = await postsRepo.getPosts(userId, options);
    return {
      data,
      pagination: {
        page: options.page,
        pageSize: options.pageSize,
        total,
        totalPages: Math.ceil(total / options.pageSize),
      },
    };
  } catch (error) {
    throw serverError(error);
  }
}

/**
 * Get a single post by ID. Returns NOT_FOUND if missing.
 */
export async function getPost(userId: string, postId: string): Promise<Post> {
  try {
    const post = await postsRepo.getPost(userId, postId);
    if (!post) {
      throw notFoundError("We couldn't find that draft. It may have been deleted.");
    }
    return post;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw serverError(error);
  }
}

/**
 * Create a new post. Validates with Zod, sanitizes strings.
 */
export async function createPost(
  userId: string,
  input: CreatePostInput
): Promise<Post> {
  const validated = createPostSchema.parse(input);

  const sanitized = {
    title: sanitizeString(validated.title),
    content: sanitizeString(validated.content),
    status: validated.status,
  };

  try {
    return await postsRepo.createPost(userId, sanitized);
  } catch (error) {
    throw serverError(error);
  }
}

/**
 * Update a post (content and/or status transition).
 * Validates status transitions per FRD FR-C3.
 */
export async function updatePost(
  userId: string,
  postId: string,
  input: UpdatePostInput
): Promise<Post> {
  const validated = updatePostSchema.parse(input);

  // If status change requested, validate the transition
  if (validated.status) {
    const currentPost = await postsRepo.getPost(userId, postId);
    if (!currentPost) {
      throw notFoundError("We couldn't find that draft. It may have been deleted.");
    }

    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentPost.status];
    if (!allowedTransitions.includes(validated.status)) {
      throw validationError(
        `Cannot change status from "${currentPost.status}" to "${validated.status}".`,
        'status'
      );
    }
  }

  // Sanitize string fields
  const sanitized: Partial<{ title: string; content: string; status: PostStatus }> = {};
  if (validated.title !== undefined) sanitized.title = sanitizeString(validated.title);
  if (validated.content !== undefined) sanitized.content = sanitizeString(validated.content);
  if (validated.status !== undefined) sanitized.status = validated.status;

  try {
    const updated = await postsRepo.updatePost(userId, postId, sanitized);
    if (!updated) {
      throw notFoundError("We couldn't find that draft. It may have been deleted.");
    }
    return updated;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw serverError(error);
  }
}

/**
 * Soft-delete: archive a post.
 */
export async function archivePost(userId: string, postId: string): Promise<Post> {
  try {
    const post = await postsRepo.getPost(userId, postId);
    if (!post) {
      throw notFoundError("We couldn't find that draft. It may have been deleted.");
    }

    // Validate transition
    const allowedTransitions = VALID_STATUS_TRANSITIONS[post.status];
    if (!allowedTransitions.includes('archived')) {
      throw validationError(
        `Cannot archive a post with status "${post.status}".`,
        'status'
      );
    }

    const archived = await postsRepo.archivePost(userId, postId);
    if (!archived) {
      throw notFoundError("We couldn't find that draft. It may have been deleted.");
    }
    return archived;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw serverError(error);
  }
}

/**
 * Hard-delete: permanently delete an already-archived post.
 */
export async function permanentDeletePost(userId: string, postId: string): Promise<void> {
  try {
    const deleted = await postsRepo.permanentDeletePost(userId, postId);
    if (!deleted) {
      throw notFoundError(
        "We couldn't find that archived draft. Only archived posts can be permanently deleted."
      );
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw serverError(error);
  }
}

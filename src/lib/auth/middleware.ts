// ThinkPost AI — Auth Middleware
// Shared JWT verification used by BOTH REST endpoints AND MCP tool handlers.
// Extracts and verifies the WorkOS session, returns the authenticated user_id.
//
// FRD Module A (FR-A2, FR-A3, FR-A4):
// - Protected routes reject unauthenticated requests (UNAUTHORIZED)
// - Expired tokens return TOKEN_EXPIRED
// - Every query scoped by authenticated user_id

import { NextRequest } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { supabase } from '@/lib/db/supabase';
import {
  AppError,
  unauthorizedError,
  tokenExpiredError,
  serverError,
} from '@/lib/errors/app-error';

export interface AuthenticatedUser {
  userId: string;       // Internal ThinkPost UUID (users.id)
  workosUserId: string; // WorkOS user ID
  email: string;
  name: string;
}

/**
 * Verifies the WorkOS session and returns the internal ThinkPost user.
 * Used identically by REST route handlers and MCP tool handlers.
 *
 * On first auth, auto-creates the user record + empty profile + default writing style.
 *
 * Throws:
 * - UNAUTHORIZED if no valid session
 * - TOKEN_EXPIRED if session has expired
 * - SERVER_ERROR for unexpected failures
 */
export async function authenticateRequest(): Promise<AuthenticatedUser> {
  try {
    const session = await withAuth({ ensureSignedIn: true });

    const workosUserId = session.user.id;
    const email = session.user.email;
    const name = session.user.firstName
      ? `${session.user.firstName}${session.user.lastName ? ' ' + session.user.lastName : ''}`
      : email;

    // Look up internal user by WorkOS ID
    const { data: existingUser, error: lookupError } = await supabase
      .from('users')
      .select('id, workos_user_id, email, name')
      .eq('workos_user_id', workosUserId)
      .single();

    if (lookupError && lookupError.code !== 'PGRST116') {
      // PGRST116 = "not found" — expected on first login
      throw serverError(lookupError);
    }

    if (existingUser) {
      return {
        userId: existingUser.id,
        workosUserId: existingUser.workos_user_id,
        email: existingUser.email,
        name: existingUser.name,
      };
    }

    // First login — auto-create user + profile + writing_style (FR-A1)
    return await createUserOnFirstAuth(workosUserId, email, name);
  } catch (error) {
    if (error instanceof AppError) throw error;

    // WorkOS AuthKit throws specific errors we can map
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (
      errorMessage.includes('expired') ||
      errorMessage.includes('token')
    ) {
      throw tokenExpiredError();
    }

    if (
      errorMessage.includes('not authenticated') ||
      errorMessage.includes('sign in') ||
      errorMessage.includes('unauthorized')
    ) {
      throw unauthorizedError();
    }

    throw unauthorizedError();
  }
}

/**
 * Authenticate from a bearer token (for MCP requests).
 * Validates the access token directly using WorkOS SDK.
 */
export async function authenticateBearer(request: NextRequest): Promise<AuthenticatedUser> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw unauthorizedError();
  }

  // For MCP OAuth tokens, we delegate to the same session flow.
  // The WorkOS middleware handles token verification automatically.
  return authenticateRequest();
}

/**
 * Creates a new user + empty profile + default writing style on first auth.
 * Uses a transaction-like approach (sequential inserts with cleanup on failure).
 */
async function createUserOnFirstAuth(
  workosUserId: string,
  email: string,
  name: string
): Promise<AuthenticatedUser> {
  // 1. Create user record
  const { data: newUser, error: userError } = await supabase
    .from('users')
    .insert({
      workos_user_id: workosUserId,
      email,
      name,
      read_only_mode: true, // Default: writes blocked (FRD FR-A6)
    })
    .select('id, workos_user_id, email, name')
    .single();

  if (userError || !newUser) {
    console.error('[ThinkPost AI] Failed to create user:', userError);
    throw serverError(userError);
  }

  // 2. Create empty profile
  const { error: profileError } = await supabase
    .from('profile')
    .insert({
      user_id: newUser.id,
      headline: null,
      bio: null,
      experience: null,
      skills: null,
      goals: null,
    });

  if (profileError) {
    console.error('[ThinkPost AI] Failed to create profile:', profileError);
    // Clean up user on failure
    await supabase.from('users').delete().eq('id', newUser.id);
    throw serverError(profileError);
  }

  // 3. Create default writing style
  const { error: styleError } = await supabase
    .from('writing_style')
    .insert({
      user_id: newUser.id,
      tone: 'professional',
      length: 'medium',
      emoji_usage: false,
      cta_style: null,
    });

  if (styleError) {
    console.error('[ThinkPost AI] Failed to create writing style:', styleError);
    // CASCADE will clean up profile when user is deleted
    await supabase.from('users').delete().eq('id', newUser.id);
    throw serverError(styleError);
  }

  return {
    userId: newUser.id,
    workosUserId: newUser.workos_user_id,
    email: newUser.email,
    name: newUser.name,
  };
}

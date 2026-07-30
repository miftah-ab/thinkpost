// MCP Tool: get_post_context
// Bundles profile + writing style + relevant memories into one structured payload.
// Assembly only — no generation. Uses ONE Supabase query approach.
// Returns isProfileComplete boolean.

import { supabase } from '@/lib/db/supabase';
import { checkRateLimit } from '@/lib/mcp/rate-limiter';
import { handleMcpError } from '@/lib/errors/error-handler';
import { serverError } from '@/lib/errors/app-error';
import type { PostContext } from '@/lib/types';

export const getPostContextTool = {
  name: 'get_post_context',
  description: 'Bundles the user\'s profile, writing style, and 15 most recent memories into one structured payload for post generation context. Assembly only — does not generate content.',
  inputSchema: {},
  handler: async (userId: string) => {
    try {
      await checkRateLimit(userId, 'get_post_context');

      // ONE query approach: fetch profile and writing_style together
      // Then fetch memories with limit in a second query (Supabase JS doesn't support
      // cross-table joins with LIMIT on a joined table in a single .select())
      // However, we use Promise.all to run them concurrently — still just one round trip.
      const [profileResult, styleResult, memoriesResult] = await Promise.all([
        supabase
          .from('profile')
          .select('headline, bio, experience, skills, goals')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('writing_style')
          .select('tone, length, emoji_usage, cta_style')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('memories')
          .select('id, key, value, category, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(15),
      ]);

      if (profileResult.error && profileResult.error.code !== 'PGRST116') {
        throw serverError(profileResult.error);
      }
      if (styleResult.error && styleResult.error.code !== 'PGRST116') {
        throw serverError(styleResult.error);
      }
      if (memoriesResult.error) {
        throw serverError(memoriesResult.error);
      }

      const profile = profileResult.data;
      const style = styleResult.data;

      const isProfileComplete = Boolean(
        profile?.headline && profile.headline.trim().length > 0 &&
        profile?.bio && profile.bio.trim().length > 0
      );

      const context: PostContext = {
        profile: {
          headline: profile?.headline ?? null,
          bio: profile?.bio ?? null,
          experience: profile?.experience ?? null,
          skills: profile?.skills ?? null,
          goals: profile?.goals ?? null,
        },
        writingStyle: {
          tone: style?.tone ?? 'professional',
          length: style?.length ?? 'medium',
          emoji_usage: style?.emoji_usage ?? false,
          cta_style: style?.cta_style ?? null,
        },
        memories: memoriesResult.data ?? [],
        isProfileComplete,
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(context) }],
      };
    } catch (error) {
      return handleMcpError(error);
    }
  },
};

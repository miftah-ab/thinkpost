// MCP Tool: get_profile
// Returns profile fields + isProfileComplete boolean.

import * as profileService from '@/lib/services/profile.service';
import { checkRateLimit } from '@/lib/mcp/rate-limiter';
import { handleMcpError } from '@/lib/errors/error-handler';
import { z } from 'zod';

export const getProfileTool = {
  name: 'get_profile',
  description: 'Returns the user\'s professional profile including headline, bio, experience, skills, goals, and whether the profile is complete.',
  inputSchema: {},
  handler: async (userId: string) => {
    try {
      await checkRateLimit(userId, 'get_profile');
      const profile = await profileService.getProfile(userId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(profile) }],
      };
    } catch (error) {
      return handleMcpError(error);
    }
  },
};

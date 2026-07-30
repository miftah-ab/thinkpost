// MCP Tool: update_profile
// Updates profile fields. Write tool — checks read_only_mode.

import * as profileService from '@/lib/services/profile.service';
import * as usersService from '@/lib/services/users.service';
import { checkRateLimit } from '@/lib/mcp/rate-limiter';
import { readOnlyModeError } from '@/lib/errors/app-error';
import { handleMcpError } from '@/lib/errors/error-handler';
import { updateProfileSchema } from '@/lib/validation/profile.schema';

export const updateProfileTool = {
  name: 'update_profile',
  description: 'Updates the user\'s professional profile. Allows partial updates.',
  inputSchema: updateProfileSchema.shape,
  handler: async (userId: string, args: Record<string, unknown>) => {
    try {
      await checkRateLimit(userId, 'update_profile');

      // Check read-only mode (FR-A6)
      const readOnly = await usersService.getReadOnlyMode(userId);
      if (readOnly) throw readOnlyModeError();

      const profile = await profileService.updateProfile(userId, args);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(profile) }],
      };
    } catch (error) {
      return handleMcpError(error);
    }
  },
};

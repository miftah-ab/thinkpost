// MCP Tool: update_writing_style
// Updates writing preferences. Write tool — checks read_only_mode.

import * as writingStyleService from '@/lib/services/writing-style.service';
import * as usersService from '@/lib/services/users.service';
import { checkRateLimit } from '@/lib/mcp/rate-limiter';
import { readOnlyModeError } from '@/lib/errors/app-error';
import { handleMcpError } from '@/lib/errors/error-handler';
import { updateWritingStyleSchema } from '@/lib/validation/writing-style.schema';

export const updateWritingStyleTool = {
  name: 'update_writing_style',
  description: 'Updates the user\'s writing style preferences.',
  inputSchema: updateWritingStyleSchema.shape,
  handler: async (userId: string, args: Record<string, unknown>) => {
    try {
      await checkRateLimit(userId, 'update_writing_style');

      const readOnly = await usersService.getReadOnlyMode(userId);
      if (readOnly) throw readOnlyModeError();

      const style = await writingStyleService.updateWritingStyle(userId, args as Parameters<typeof writingStyleService.updateWritingStyle>[1]);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(style) }],
      };
    } catch (error) {
      return handleMcpError(error);
    }
  },
};

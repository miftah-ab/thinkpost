// MCP Tool: get_writing_style
// Returns tone, length, emoji_usage, cta_style.

import * as writingStyleService from '@/lib/services/writing-style.service';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { checkRateLimit } from '@/lib/mcp/rate-limiter';
import { handleMcpError } from '@/lib/errors/error-handler';

export const getWritingStyleTool = {
  name: 'get_writing_style',
  description: 'Returns the user\'s writing style preferences including tone, length, emoji usage, and custom CTA style.',
  inputSchema: {},
  handler: async (userId: string) => {
    try {
      await checkRateLimit(userId, 'get_writing_style');
      const style = await writingStyleService.getWritingStyle(userId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(style) }],
      };
    } catch (error) {
      return handleMcpError(error);
    }
  },
};

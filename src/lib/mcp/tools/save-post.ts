// MCP Tool: save_post
// Persists a draft. Write tool — checks read_only_mode.

import * as postsService from '@/lib/services/posts.service';
import * as usersService from '@/lib/services/users.service';
import { checkRateLimit } from '@/lib/mcp/rate-limiter';
import { readOnlyModeError } from '@/lib/errors/app-error';
import { handleMcpError } from '@/lib/errors/error-handler';
import { createPostSchema } from '@/lib/validation/posts.schema';

export const savePostTool = {
  name: 'save_post',
  description: 'Saves a draft post. Requires title and content. Status defaults to "draft".',
  inputSchema: createPostSchema.shape,
  handler: async (userId: string, args: Record<string, unknown>) => {
    try {
      await checkRateLimit(userId, 'save_post');

      const readOnly = await usersService.getReadOnlyMode(userId);
      if (readOnly) throw readOnlyModeError();

      const post = await postsService.createPost(userId, {
        title: args.title as string,
        content: args.content as string,
        status: (args.status as 'draft' | 'published' | 'archived') || 'draft',
      });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(post) }],
      };
    } catch (error) {
      return handleMcpError(error);
    }
  },
};

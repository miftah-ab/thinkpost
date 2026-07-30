// MCP Tool: list_posts
// Returns paginated draft list.

import * as postsService from '@/lib/services/posts.service';
import { checkRateLimit } from '@/lib/mcp/rate-limiter';
import { handleMcpError } from '@/lib/errors/error-handler';
import { z } from 'zod';

export const listPostsTool = {
  name: 'list_posts',
  description: 'Returns a paginated list of the user\'s posts. Supports pagination and sorting.',
  inputSchema: {
    page: z.number().optional().describe('Page number (default: 1)'),
    pageSize: z.number().optional().describe('Items per page (default: 10, max: 100)'),
    sortBy: z.enum(['created_at', 'updated_at']).optional().describe('Sort field (default: created_at)'),
  },
  handler: async (userId: string, args: Record<string, unknown>) => {
    try {
      await checkRateLimit(userId, 'list_posts');
      const result = await postsService.getPosts(userId, {
        page: (args.page as number) || 1,
        pageSize: Math.min((args.pageSize as number) || 10, 100),
        sortBy: (args.sortBy as 'created_at' | 'updated_at') || 'created_at',
      });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result) }],
      };
    } catch (error) {
      return handleMcpError(error);
    }
  },
};

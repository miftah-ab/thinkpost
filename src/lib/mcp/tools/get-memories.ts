// MCP Tool: get_memories
// Returns memories, optionally filtered by category, capped at 15.

import * as memoriesService from '@/lib/services/memories.service';
import { checkRateLimit } from '@/lib/mcp/rate-limiter';
import { handleMcpError } from '@/lib/errors/error-handler';
import { getMemoriesQuerySchema } from '@/lib/validation/memories.schema';
import type { MemoryCategory } from '@/lib/types';
import { MEMORY_CATEGORIES } from '@/lib/types';

export const getMemoriesTool = {
  name: 'get_memories',
  description: 'Returns the user\'s memories (facts, topics, tone notes) used for personalization. Optionally filter by category.',
  inputSchema: getMemoriesQuerySchema.shape,
  handler: async (userId: string, args: Record<string, unknown>) => {
    try {
      await checkRateLimit(userId, 'get_memories');
      const category = args.category as MemoryCategory | undefined;
      // Cap at 15 most recent (FRD Decision #8)
      const memories = await memoriesService.getRecentMemories(userId, 15, category);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ data: memories }) }],
      };
    } catch (error) {
      return handleMcpError(error);
    }
  },
};

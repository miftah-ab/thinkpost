// ThinkPost AI — MCP Server
// Registers all 8 tools with their schemas.
// Transport: Streamable HTTP (not SSE) — FRD Decision #1.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getProfileTool } from './tools/get-profile';
import { updateProfileTool } from './tools/update-profile';
import { getWritingStyleTool } from './tools/get-writing-style';
import { updateWritingStyleTool } from './tools/update-writing-style';
import { getMemoriesTool } from './tools/get-memories';
import { getPostContextTool } from './tools/get-post-context';
import { savePostTool } from './tools/save-post';
import { listPostsTool } from './tools/list-posts';

// All tool definitions
const ALL_TOOLS = [
  getProfileTool,
  updateProfileTool,
  getWritingStyleTool,
  updateWritingStyleTool,
  getMemoriesTool,
  getPostContextTool,
  savePostTool,
  listPostsTool,
] as const;

/**
 * Creates and configures the MCP server with all ThinkPost AI tools.
 */
export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'ThinkPost AI',
    version: '1.0.0',
  });

  // Register all tools
  for (const tool of ALL_TOOLS) {
    server.tool(
      tool.name,
      tool.description,
      tool.inputSchema,
      async (args: Record<string, unknown>, extra: Record<string, unknown>) => {
        // userId is injected by the route handler after auth verification
        const userId = (extra as { userId?: string }).userId;
        if (!userId) {
          return {
            content: [{ type: 'text' as const, text: JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'You need to sign in to do that.' } }) }],
            isError: true,
          };
        }
        return tool.handler(userId, args);
      }
    );
  }

  return server;
}

export { ALL_TOOLS };

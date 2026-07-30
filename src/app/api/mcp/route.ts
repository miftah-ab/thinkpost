// ThinkPost AI — MCP Streamable HTTP Route
// Bridges Next.js App Router to the MCP server via Streamable HTTP transport.
// Transport: Streamable HTTP (not SSE) — FRD Decision #1.
// Auth: Bearer token verified via shared auth middleware.

import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createMcpServer } from '@/lib/mcp/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/errors/error-handler';
import { unauthorizedError } from '@/lib/errors/app-error';

// Stateless mode for Vercel serverless — no session persistence needed
function createTransport() {
  return new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // Stateless mode
    enableJsonResponse: true,      // JSON responses instead of SSE streams
  });
}

async function handleMcpRequest(request: Request): Promise<Response> {
  try {
    // Authenticate the bearer token
    const user = await authenticateRequest();

    // Create server and transport for this request
    const server = createMcpServer();
    const transport = createTransport();

    // Connect server to transport
    await server.connect(transport);

    // Handle the request, passing auth info
    const response = await transport.handleRequest(request, {
      authInfo: {
        token: request.headers.get('authorization')?.replace('Bearer ', '') || '',
        clientId: 'thinkpost-mcp',
        scopes: [],
        extra: { userId: user.userId },
      },
    });

    return response;
  } catch (error) {
    // Convert to standard error response
    const errorResponse = handleApiError(error);
    return errorResponse;
  }
}

export async function GET(request: Request) {
  return handleMcpRequest(request);
}

export async function POST(request: Request) {
  return handleMcpRequest(request);
}

export async function DELETE(request: Request) {
  return handleMcpRequest(request);
}

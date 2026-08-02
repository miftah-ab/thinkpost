import { authkitMiddleware } from '@workos-inc/authkit-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';

// Initialize the WorkOS handler
const workosMiddleware = authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: ['/auth/callback', '/', '/api/mcp'],
  },
});

// Wrap the execution to catch runtime Edge errors
export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  try {
    return await workosMiddleware(req, event);
  } catch (err) {
    console.error("MIDDLEWARE CRASH:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    
    // Print the EXACT reason to the browser screen so we can fix it!
    return new NextResponse(
      `AuthKit Middleware Crashed!\n\nReason: ${errorMessage}\n\nPlease copy this error and share it with the developer.`,
      { status: 500, headers: { 'content-type': 'text/plain' } }
    );
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

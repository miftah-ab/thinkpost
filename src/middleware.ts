import { authkitMiddleware } from '@workos-inc/authkit-nextjs';
import { NextResponse } from 'next/server';

export default function middleware(req: any) {
  // If WorkOS env vars are not set, allow request to proceed or return helpful message instead of hard crashing Vercel
  if (!process.env.WORKOS_COOKIE_PASSWORD || !process.env.WORKOS_CLIENT_ID) {
    console.error('WorkOS environment variables missing in Vercel configuration.');
  }

  try {
    const handler = authkitMiddleware({
      middlewareAuth: {
        enabled: true,
        unauthenticatedPaths: ['/auth/callback', '/', '/api/mcp'],
      },
    });
    return handler(req);
  } catch (err) {
    console.error('Middleware execution error:', err);
    return NextResponse.next();
  }
}

export const config = {
  // Match all request paths except static files, images, favicon, and mcp api
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

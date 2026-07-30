import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: ['/auth/callback', '/', '/api/mcp'],
  },
});

export const config = {
  // Match all request paths except static files, images, and favicon
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

export default authkitMiddleware({
  // Require authentication for all routes in the dashboard and all API routes
  // (except the auth callback route which needs to be accessible to complete login)
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: ['/auth/callback', '/'],
  },
});

export const config = {
  // Match all request paths except for the ones starting with:
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

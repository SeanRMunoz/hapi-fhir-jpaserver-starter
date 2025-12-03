import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Enhance Clerk middleware to also manage the Authorization cookie for /dashboard
export default clerkMiddleware(async (auth, req) => {
  const res = NextResponse.next();
  const AUTH_COOKIE_NAME = 'Authorization';
  const { getToken, userId } = await auth();
  const isAuthenticated = userId !== null;
  const isAuthCookiePresent = req.cookies.has(AUTH_COOKIE_NAME);

  if (isAuthenticated && !isAuthCookiePresent) {
    const template = 'jwt-long-life';
    const token = await getToken({ template }); // Get JWT token using a custom JWT template for longer expiration

    if (token) {
      res.cookies.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
      });
      console.log('[middleware] Authorization cookie SET');
    }
  }

  if (!isAuthenticated && isAuthCookiePresent) {
    res.cookies.delete(AUTH_COOKIE_NAME);
    console.log('[middleware] Authorization cookie REMOVED');
  }

  return res;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
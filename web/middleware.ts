import { auth, clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Enhance Clerk middleware to also manage the Authorization cookie for /dashboard
export default clerkMiddleware(async (auth, req) => {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;
  const isDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/');

  if (isDashboard) {
    const { getToken } = await auth();
    const jwt_template = 'jwt-long-life';
    const token = await getToken({ jwt_template }); // Get JWT token using a custom JWT template for longer expiration

    if (token) {
      res.cookies.set('Authorization', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
      });
      console.log('[middleware] Authorization cookie SET');
    } else {
      res.cookies.delete('Authorization');
      console.log('[middleware] Authorization cookie REMOVED');
    }
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
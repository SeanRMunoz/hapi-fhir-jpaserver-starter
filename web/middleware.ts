import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)"
  ]
});

// Stop Middleware running on static files and public folder
export const config = {
  matcher: [
    
    "/((?!_next|.*\\..*|favicon.ico|robots.txt|sitemap.xml).*)"
  ]
};

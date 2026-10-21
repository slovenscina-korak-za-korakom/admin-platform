import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Authentication is enforced resource-side (the (protected) layout and pages
// call auth.protect()), not here — path-matching middleware checks can diverge
// from how Next.js routes requests. This middleware only handles non-auth
// concerns: locale redirects and bouncing signed-in users off the sign-in page.
export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;

  // Redirect language-prefixed routes to dashboard
  if (pathname.match(/^\/(en|sl|ru|it)(\/|$)/)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect already-authenticated users away from sign-in
  if (pathname.startsWith("/sign-in")) {
    const { userId } = await auth();
    if (userId) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

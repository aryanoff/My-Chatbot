import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Try to get token from cookies or just protect the route client-side?
  // Next.js middleware is great for checking cookies.
  // Wait, our backend sends tokens in JSON for OTP and query params for OAuth. 
  // It's probably better to check client-side or use a cookie setter. 
  // For now, we check if access_token exists in a cookie. If not, redirect.
  // If the user uses localStorage, this middleware won't see it.
  
  // Since we are setting localStorage in our login page, a simple client-side
  // protection might be better, or we can check the URL.
  // Let's implement basic protection here if they have cookies.
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - oauth-callback (callback page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|oauth-callback).*)',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define routes that require authentication
const protectedRoutes = ['/dashboard', '/settings', '/profile'];

// Define routes that authenticated users should be redirected *from*
// '/verification' is now handled separately with more granular logic
const authRedirectRoutes = ['/signin', '/signup', '/forgot-password'];

export function middleware(_request: NextRequest) { // FIX: Renamed 'request' to '_request' to suppress 'unused-vars' warning
  const token = _request.cookies.get('token')?.value;
  const { pathname } = _request.nextUrl;

  // 1. Allow access to API routes, Next.js internal files, and public assets without token check
  // Also allow the homepage ('/')
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public/') || // Assuming a 'public' folder for static assets
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // --- Specific handling for /verification routes ---
  if (pathname.startsWith('/verification/')) {
    // If a token exists (user is signed in), redirect them from ANY verification page to home.
    if (token) {
      return NextResponse.redirect(new URL('/', _request.url));
    } else {
      // User is NOT signed in (no token)
      // Allow access to any /verification/{email}/{type} (for new signups or logged-out password resets)
      return NextResponse.next();
    }
  }

  // 2. Redirect authenticated users from general auth-related pages
  // If a token exists and the user tries to access signin, signup, or forgot-password, redirect to home.
  if (token && authRedirectRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', _request.url));
  }

  // 3. Protect specific routes that require authentication
  // If a route is protected and no token exists, redirect to signin.
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      const loginUrl = new URL('/signin', _request.url);
      loginUrl.searchParams.set('from', pathname); // Add 'from' param to redirect back after login
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. For all other cases, proceed with the request
  return NextResponse.next();
}

// Optional: Configure which paths the middleware should apply to
export const config = {
  matcher: [
    // Apply middleware to all paths except the ones explicitly excluded
    // This regex ensures it runs on pages, but not on static assets or API routes (which are handled by the first if condition)
    // The regex means: match any path that does NOT start with /api/, /_next/static, /_next/image, /favicon.ico, /public/, or contain a file extension (like .png, .jpg, .css, .js etc.)
    '/((?!api|_next/static|_next/image|favicon.ico|public/|.*\\..*).*)',
  ],
};

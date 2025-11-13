import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/auth/signin", "/auth/error", "/auth/verify-request"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("Middleware checking path:", pathname);

  // Allow public routes
  if (publicRoutes.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionToken =
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");

  console.log("Session token exists:", !!sessionToken);

  // If no session token, redirect to signin
  if (!sessionToken) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // For database sessions, we can't check role in middleware
  // Role-based authorization should be done in the page/API route
  // where you can access the full session with getServerSession()

  return NextResponse.next();
}

export const config = {
  // Match all routes that should be protected.
  matcher: [
    "/",
    "/admin/:path*",
    "/dashboard/:path*",
    "/generate/:path*",
    "/settings/:path*",
    "/sessions/:path*",
  ],
};

import { NextRequest, NextResponse } from "next/server";

// Public paths that don't require authentication
const publicPaths = ["/", "/login", "/forgot-password", "/api/auth/login"];

// Check if a path is public and doesn't require authentication
function isPublicPath(path: string): boolean {
  return (
    publicPaths.includes(path) ||
    path.startsWith("/api/auth/") ||
    path.startsWith("/_next/")
  );
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // If it's a public path, allow access
  if (isPublicPath(path)) {
    return NextResponse.next();
  }

  // For all other paths, allow access and let client-side auth handle protection
  return NextResponse.next();
}

export const config = {
  // Specify the paths that the middleware should run on
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

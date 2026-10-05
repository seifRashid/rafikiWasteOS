import { auth } from "@/lib/auth/server";
import { NextRequest, NextResponse } from "next/server";

const authMiddleware = auth.middleware({ loginUrl: "/login" });

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/admin/login",
  "/admin/register",
  "/pending-approval",
];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip auth checks for static assets and public auth API endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Allow public auth pages
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"))) {
    return NextResponse.next();
  }

  // 3. For all protected dashboard routes, execute Neon Auth middleware
  return authMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files and favicon:
     */
    "/((?!_next/static|_next/image|favicon.ico|avatar.*\\.jpg).*)",
  ],
};

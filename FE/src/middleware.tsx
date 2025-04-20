import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith("/auth/");
  const isProtectedRoute =
    !isAuthPage &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/static") &&
    !pathname.startsWith("/favicon.ico");

  const isAuthenticated = !!token;

  // console.log("Middleware Debug Info:");
  // console.log("Current path:", pathname);
  // console.log("Is auth page:", isAuthPage);
  // console.log("Is protected route:", isProtectedRoute);
  // console.log("Is authenticated:", isAuthenticated);
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};

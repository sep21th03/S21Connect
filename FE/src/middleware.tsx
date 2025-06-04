import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;
  const publicPaths = ["/auth", "/payment"];
  const isPublicRoute = publicPaths.some((path) => pathname.startsWith(path));

  console.log("TOKEN IN MIDDLEWARE:", token);
  console.log("REQ COOKIES:", req.cookies.getAll());
  console.log("URL:", req.nextUrl.pathname);

  const isAuthenticated = !!token;

  if (pathname.startsWith("/auth") && isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!isPublicRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};

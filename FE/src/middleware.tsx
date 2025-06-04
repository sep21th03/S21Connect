import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const publicPaths = ["/auth", "/payment"];
  const isPublicRoute = publicPaths.some((path) => pathname.startsWith(path));

  let isAuthenticated = false;

  try {
    // Thử lấy token bằng getToken
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      // Thử cả hai tên cookie
      cookieName: process.env.NODE_ENV === "production" 
        ? "__Secure-next-auth.session-token" 
        : "next-auth.session-token"
    });

    if (token) {
      isAuthenticated = true;
      console.log("✅ Token found via getToken");
    } else {
      // Fallback: kiểm tra trực tiếp cookie
      const sessionToken = req.cookies.get("next-auth.session-token")?.value ||
                          req.cookies.get("__Secure-next-auth.session-token")?.value;
      
      if (sessionToken) {
        isAuthenticated = true;
        console.log("✅ Token found via direct cookie access");
      }
    }

    console.log("🔍 Debug info:");
    console.log("- Pathname:", pathname);
    console.log("- Is authenticated:", isAuthenticated);
    console.log("- Available cookies:", req.cookies.getAll().map(c => c.name));
    console.log("- Environment:", process.env.NODE_ENV);

  } catch (error) {
    console.error("❌ Error in middleware:", error);
    // Trong trường hợp lỗi, coi như chưa đăng nhập
    isAuthenticated = false;
  }

  // Redirect logic
  if (pathname.startsWith("/auth") && isAuthenticated) {
    console.log("🔄 Redirecting authenticated user from auth page");
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!isPublicRoute && !isAuthenticated) {
    console.log("🔄 Redirecting unauthenticated user to login");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
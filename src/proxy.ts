import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authConfig } from "@/utils/auth";

const protectedRoutes = ["/dashboard", "/tips", "/recipes", "/appointments", "/patients", "/settings"];

export function proxy(request: NextRequest) {
  const session = request.cookies.get(authConfig.SESSION_COOKIE)?.value;
  const path = request.nextUrl.pathname;

  const needsAuth = protectedRoutes.some((route) => path.startsWith(route));
  const isAuthPage = path.startsWith("/login");

  if (needsAuth && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/tips/:path*", "/recipes/:path*", "/appointments/:path*", "/patients/:path*", "/settings/:path*", "/login"],
};

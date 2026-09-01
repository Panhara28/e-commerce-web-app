import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATH_PREFIXES = ["/views", "/health"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (isPublic) return NextResponse.next();

  const hasToken = Boolean(request.cookies.get("admin_token")?.value);
  if (hasToken) return NextResponse.next();

  const signInUrl = new URL("/views/signin", request.url);
  signInUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  // Runs on every page request except API routes, Next internals, and files
  // served from /public (anything with a static-asset extension) — otherwise the
  // redirect below also swallows images like /login-banner.png for logged-out
  // visitors. The API proxy already enforces real auth server-side; this just
  // keeps unauthenticated visitors from seeing the admin shell before that.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|gif|svg|webp|avif|ico|css|js|mjs|map|txt|woff2?|ttf|otf|eot)$).*)",
  ],
};

import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATH_PREFIXES = ["/views"];

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
  // Runs on every page request except static assets and API routes — the
  // API proxy already enforces real auth server-side; this just keeps
  // unauthenticated visitors from seeing the admin shell before that.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api-base-url";

const ADMIN_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
  const body = await request.text();

  const upstream = await fetch(`${API_BASE_URL}/api/auth/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const json = await upstream.json().catch(() => null);

  if (!upstream.ok || !json?.token) {
    return NextResponse.json(json ?? { error: "Login failed" }, { status: upstream.status });
  }

  const { token, ...rest } = json;
  const response = NextResponse.json(rest);

  // Set server-side so the token is never exposed to page JavaScript (mitigates
  // token theft via XSS) — the client no longer needs to read or set this cookie.
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_TOKEN_MAX_AGE,
  });

  return response;
}

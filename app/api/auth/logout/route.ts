import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api-base-url";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;

  if (token) {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
    }).catch(() => null);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

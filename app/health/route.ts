import { NextResponse } from "next/server";

// Liveness probe for the deploy tooling / reverse proxy. Public — see proxy.ts.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok" });
}

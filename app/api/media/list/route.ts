/* eslint-disable */
import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const media = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ media });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

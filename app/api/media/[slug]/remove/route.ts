/* eslint-disable */
import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function DELETE(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  // ✅ FIX: params must be awaited in Next.js App Router API
  const { slug } = await context.params;

  console.log("🔥 API DELETE HIT FOR SLUG:", slug);

  try {
    const deleted = await prisma.media.delete({
      where: { slug },
    });

    console.log("🔥 MEDIA DELETED:", deleted);

    return NextResponse.json({ status: "ok", deleted });
  } catch (err: any) {
    console.error("❌ DELETE ERROR:", err);

    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}

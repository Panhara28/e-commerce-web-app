import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const body = await req.json();

    if (!Object.keys(body).length) {
      return NextResponse.json(
        { error: "No fields provided" },
        { status: 400 }
      );
    }

    // Hash new password if provided
    if (body.password) {
      body.password = await hash(body.password, 10);
    }

    const updated = await prisma.customer.update({
      where: { slug },
      data: body,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("UPDATE CUSTOMER ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { PrismaClient, CustomerStatus } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const customer = await prisma.customer.findUnique({
      where: { slug },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.customer.update({
      where: { slug },
      data: { status: CustomerStatus.DELETED },
    });

    return NextResponse.json({
      success: true,
      message: "Customer deleted (soft delete)",
      data: updated,
    });
  } catch (error: any) {
    console.error("DELETE CUSTOMER ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

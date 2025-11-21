import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null }, // top-level only
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true, // supports deeper levels if needed
              },
            },
          },
        },
        parent: true,
      },
      orderBy: { name: "asc" },
    });

    // Format output
    const formatCategory = (cat: any) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      parent: cat.parent
        ? { id: cat.parent.id, slug: cat.parent.slug, name: cat.parent.name }
        : null,
      children: cat.children?.map((child: any) => formatCategory(child)) || [],
    });

    const tree = categories.map((cat) => formatCategory(cat));

    return NextResponse.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    console.error("Error fetching category tree:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}

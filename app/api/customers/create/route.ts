import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      username,
      password,
      firstName,
      lastName,
      email,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
    } = body;

    if (!username || !password || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const customer = await prisma.customer.create({
      data: {
        username,
        password: hashedPassword,
        firstName,
        lastName,
        email,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
      },
    });

    return NextResponse.json(
      { success: true, data: customer },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("CREATE CUSTOMER ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

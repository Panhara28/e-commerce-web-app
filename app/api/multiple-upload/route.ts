/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { PrismaClient } from "@/lib/generated/prisma";
import { S3MultipleUploadStrategy } from "@/lib/uploads/multiple-upload-digital-ocean";

const prisma = new PrismaClient();

// --- INIT YOUR STRATEGY (DigitalOcean Spaces / S3) ---
const uploadStrategy = new S3MultipleUploadStrategy({
  bucket: process.env.DO_BUCKET!,
  region: process.env.DO_REGION!,
  endpoint: process.env.DO_ENDPOINT!,
  accessKeyId: process.env.DO_ACCESS_KEY!,
  secretAccessKey: process.env.DO_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const folder = form.get("folder")?.toString() || "uploads";

    const files = form.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: "No files uploaded" },
        { status: 400 }
      );
    }

    const uploads = await Promise.all(
      files.map(async (file: File) => {
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // ---------------------------
        // 1) Upload to DigitalOcean S3
        // ---------------------------
        const uploaded = await uploadStrategy.upload(folder, {
          originalname: file.name,
          mimetype: file.type,
          buffer,
          size: buffer.length,
        });

        // ---------------------------
        // 2) Image dimension detection
        // ---------------------------
        let width: number | null = null;
        let height: number | null = null;

        if (file.type.startsWith("image/")) {
          try {
            const meta = await sharp(buffer).metadata();
            width = meta.width ?? null;
            height = meta.height ?? null;
          } catch (err) {
            console.warn("Failed to get sharp metadata:", err);
          }
        }

        // ---------------------------
        // 3) Save Media metadata to DB
        // ---------------------------
        const media = await prisma.media.create({
          data: {
            filename: uploaded.originalName,
            storedFilename: uploaded.filename,
            url: uploaded.url,
            type: file.type.split("/")[0].toUpperCase() as any,
            mimetype: file.type,
            extension: file.name.split(".").pop() || "",
            size: buffer.length,
            title: uploaded.originalName,
            altText: "",
            description: "",
            uploadedById: 1, // TODO: change to auth user
            width: width ?? undefined,
            height: height ?? undefined,
            visibility: "PUBLIC",
          },
        });

        return media;
      })
    );

    return NextResponse.json(
      { status: "ok", uploads },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("❌ File upload failed:", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}

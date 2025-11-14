/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { PrismaClient } from "@/lib/generated/prisma";
import { S3UploadStrategy } from "@/lib/uploads/s3-upload-strategy";

const prisma = new PrismaClient();
const uploadStrategy = new S3UploadStrategy();

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const folder = form.get("folder")?.toString() || "uploads";
    const files = form.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { status: "error", message: "No files uploaded" },
        { status: 400 }
      );
    }

    const uploads = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());

        // ---- Upload to DO Spaces ----
        const uploaded = await uploadStrategy.upload(folder, {
          originalname: file.name,
          mimetype: file.type,
          buffer,
          size: buffer.length,
        });

        // ---- Read width/height ----
        let width: number | null = null;
        let height: number | null = null;

        if (file.type.startsWith("image/")) {
          try {
            const meta = await sharp(buffer).metadata();
            width = meta.width ?? null;
            height = meta.height ?? null;
          } catch {}
        }

        // ---- Save DB record ----
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
            uploadedById: 1,
            width: width ?? undefined,
            height: height ?? undefined,
            visibility: "PUBLIC",
          },
        });

        // ---- Normalize response for frontend ----
        return {
          id: media.slug, // UI needs this
          slug: media.slug,
          url: media.url,
          filename: media.filename,
          storedFilename: media.storedFilename,
          type: media.type,
          width: media.width,
          height: media.height,
        };
      })
    );

    return NextResponse.json({ status: "ok", uploads }, { status: 201 });
  } catch (error: any) {
    console.error("❌ Upload failed:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

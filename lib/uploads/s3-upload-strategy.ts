/* eslint-disable */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { extname } from "path";

export class S3UploadStrategy {
  private s3: S3Client;
  private bucket: string;
  private region: string;
  private endpoint: string;

  constructor() {
    this.region = process.env.SPACES_REGION || "sgp1";
    this.bucket = process.env.SPACES_BUCKET!;
    this.endpoint = process.env.SPACES_ENDPOINT!;
    // example ENV: https://sgp1.digitaloceanspaces.com

    this.s3 = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: process.env.SPACES_KEY!,
        secretAccessKey: process.env.SPACES_SECRET!,
      },
    });
  }

  async upload(
    folder: string,
    file: {
      originalname: string;
      mimetype: string;
      buffer: Buffer;
      size: number;
    }
  ) {
    const ext = extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const key = `${folder}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    });
    await this.s3.send(command);

    // ALWAYS ORIGIN URL — NEVER CDN
    const url = `https://${this.bucket}.${this.region}.digitaloceanspaces.com/${key}`;

    return {
      storage: "spaces",
      filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url, // <— always correct origin format
    };
  }
}

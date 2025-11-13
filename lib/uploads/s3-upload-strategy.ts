/* eslint-disable */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { extname } from "path";

export class S3UploadStrategy {
  private s3: S3Client;
  private bucket: string;
  private region: string;
  private cdn: string;

  constructor() {
    this.region = process.env.SPACES_REGION || "sgp1";
    this.bucket = process.env.SPACES_BUCKET!;
    this.cdn = process.env.SPACES_CDN || "cdn.digitaloceanspaces.com";

    this.s3 = new S3Client({
      region: this.region,
      endpoint: process.env.SPACES_ENDPOINT, // example: https://sgp1.digitaloceanspaces.com
      credentials: {
        accessKeyId: process.env.SPACES_KEY!,
        secretAccessKey: process.env.SPACES_SECRET!,
      },
    });
  }

  /**
   * Upload file to DigitalOcean Spaces
   * @param folder the folder inside bucket
   * @param file {originalname, mimetype, buffer, size}
   */
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

    // 👉 Public URL for the image
    const url = `https://${this.bucket}.${this.region}.${this.cdn}/${key}`;

    return {
      storage: "spaces",
      filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url,
    };
  }
}

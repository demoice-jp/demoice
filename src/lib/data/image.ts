import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

let s3Client: S3Client;
if (process.env.MINIO_PASSWORD && process.env.MINIO_API_PORT) {
  s3Client = new S3Client({
    region: "ap-northeast-1",
    endpoint: `http://localhost:${process.env.MINIO_API_PORT}`,
    forcePathStyle: true,
    credentials: {
      accessKeyId: "minio",
      secretAccessKey: process.env.MINIO_PASSWORD,
    },
  });
} else {
  s3Client = new S3Client();
}
const bucketName = process.env.S3_MEDIA_BUCKET_NAME;
if (!bucketName) {
  throw Error("S3_MEDIA_BUCKET_NAME環境変数がありません");
}

const types: { [key: string]: string | undefined } = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
};

export type SaveImageResult =
  | {
      success: true;
      location: string;
    }
  | {
      success: false;
      type: "InputError" | "ServerError";
      message: string;
    };

export async function saveContentImage(
  contentId: string,
  dataUrl: string,
  allowedExtension?: ("png" | "jpg" | "gif")[],
): Promise<SaveImageResult> {
  let blob, fileName;
  try {
    blob = await (await fetch(dataUrl)).blob();
    const mediaType = blob.type;
    const extension = types[mediaType];
    if (!extension || (allowedExtension && !(allowedExtension as string[]).includes(extension))) {
      return {
        success: false,
        type: "InputError",
        message: `${mediaType}はサポートされていないファイル形式です`,
      };
    }

    fileName = `${nanoid()}.${extension}`;
  } catch (e) {
    return {
      success: false,
      type: "InputError",
      message: "リクエスト画像がパースできません",
    };
  }

  try {
    const createFile = new PutObjectCommand({
      Bucket: bucketName,
      Key: `content-image/${contentId}/${fileName}`,
      Body: Buffer.from(await blob.arrayBuffer()),
      ContentType: blob.type,
    });
    await s3Client.send(createFile);
  } catch (e) {
    return {
      success: false,
      type: "ServerError",
      message: "画像の保存に失敗しました",
    };
  }

  return {
    success: true,
    location: `/media/content-image/${contentId}/${fileName}`,
  };
}

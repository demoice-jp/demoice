import { DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
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

export async function deleteUnlinkImages(contentId: string, content: string) {
  return deleteImagesInternal(contentId, content);
}

export async function deleteImages(contentId: string) {
  return deleteImagesInternal(contentId);
}

async function deleteImagesInternal(contentId: string, content?: string) {
  let nextContinuationToken: string | undefined = undefined;
  do {
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: `content-image/${contentId}/`,
      ContinuationToken: nextContinuationToken,
      MaxKeys: 500,
    });

    const objects = await s3Client.send(listObjectsCommand);
    const imageObjects = objects.Contents;
    if (!imageObjects) {
      return;
    }

    const toDeleteKeys: string[] = [];
    for (const imageObject of imageObjects) {
      const key = imageObject.Key;
      if (key) {
        if (!content) {
          toDeleteKeys.push(key);
        } else {
          //コンテンツに含まれないファイルは全て削除
          const path = key.split("/");
          const fileName = path[path.length - 1];
          if (!content.includes(fileName)) {
            toDeleteKeys.push(key);
          }
        }
      }
    }

    if (toDeleteKeys.length > 0) {
      const deleteObjectsCommand = new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: toDeleteKeys.map((k) => ({
            Key: k,
          })),
          Quiet: true,
        },
      });
      await s3Client.send(deleteObjectsCommand);
    }

    nextContinuationToken = objects.NextContinuationToken as string | undefined;
  } while (nextContinuationToken);
}

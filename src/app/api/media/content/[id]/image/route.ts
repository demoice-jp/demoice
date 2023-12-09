import { randomUUID } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import z from "zod";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/orm/client";

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

export type ImagePostResponse = {
  location: string;
};

export type ImagePostError = {
  message: string;
};

const postSchema = z.object({
  image: z.string(),
});

const allowedTypes: { [key: string]: string | undefined } = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
};

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.valid) {
    return Response.json(
      {
        message: "ログインして下さい",
      },
      {
        status: 401,
      },
    );
  }

  const content = await prisma.content.findUnique({
    select: {
      id: true,
    },
    where: {
      id: params.id,
      authorId: session.user!.accountId,
    },
  });
  if (!content) {
    return Response.json(
      {
        message: "アップロード先のコンテンツが見つかりません",
      },
      {
        status: 400,
      },
    );
  }

  let requestJson;
  try {
    requestJson = await request.json();
  } catch (e) {
    return Response.json(
      {
        message: "リクエスト形式が不正です",
      },
      {
        status: 400,
      },
    );
  }

  const parsedBody = postSchema.safeParse(requestJson);
  if (!parsedBody.success) {
    return Response.json(
      {
        message: "リクエストをパースできません",
      },
      {
        status: 400,
      },
    );
  }

  let blob, fileName;
  try {
    blob = await (await fetch(parsedBody.data.image)).blob();
    const mediaType = blob.type;
    const extension = allowedTypes[mediaType];
    if (!extension) {
      return Response.json(
        {
          message: `${mediaType}はサポートされていないファイル形式です`,
        },
        {
          status: 400,
        },
      );
    }

    fileName = `${randomUUID()}.${extension}`;
  } catch (e) {
    return Response.json(
      {
        message: "リクエスト画像がパースできません",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const createFile = new PutObjectCommand({
      Bucket: bucketName,
      Key: `${params.id}/${fileName}`,
      Body: Buffer.from(await blob.arrayBuffer()),
      ContentType: blob.type,
    });
    await s3Client.send(createFile);
  } catch (e) {
    return Response.json(
      {
        message: "画像の保存に失敗しました",
      },
      {
        status: 500,
      },
    );
  }

  return Response.json({
    location: `/media/${params.id}/${fileName}`,
  });
}

/* eslint-disable no-console */
import { CreateBucketCommand, PutBucketPolicyCommand, S3Client } from "@aws-sdk/client-s3";

const port = process.env.MINIO_API_PORT;
const password = process.env.MINIO_PASSWORD;

if (!port) {
  throw Error("MINIO_API_PORT環境変数がありません");
}
if (!password) {
  throw Error("MINIO_PASSWORD環境変数がありません");
}

const client = new S3Client({
  region: "ap-northeast-1",
  endpoint: `http://localhost:${port}`,
  forcePathStyle: true,
  credentials: {
    accessKeyId: "minio",
    secretAccessKey: password,
  },
});

async function init() {
  const bucketName = process.env.S3_MEDIA_BUCKET_NAME;
  if (!bucketName) {
    throw Error("S3_MEDIA_BUCKET_NAME環境変数がありません");
  }

  try {
    const createBucketCommand = new CreateBucketCommand({
      Bucket: bucketName,
    });

    await client.send(createBucketCommand);
    console.log(`${bucketName}バケットが作成されました`);

    const putBucketPolicyCommand = new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PublicReadGetObject",
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      }),
    });
    await client.send(putBucketPolicyCommand);
    console.log(`${bucketName}ポリシーが設定されました`);
  } catch (err) {
    console.error(err);
  }
}

init().finally(() => {
  console.log("MinIOの初期化を終了します");
});

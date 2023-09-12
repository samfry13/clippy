import { S3Client } from "@aws-sdk/client-s3";
import { NodeJsClient } from "@smithy/types";

if (
  !process.env.AWS_ENDPOINT ||
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_ACCESS_KEY_SECRET
)
  throw new Error("Must have aws creds to use s3");

type Client = NodeJsClient<S3Client>;
declare global {
  var s3: Client | undefined;
}

export const s3 =
  global.s3 ||
  (new S3Client({
    region: process.env.AWS_BUCKET_REGION || "auto",
    endpoint: process.env.AWS_ENDPOINT,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
    },
  }) as Client);

if (process.env.NODE_ENV !== "production") {
  global.s3 = s3;
}

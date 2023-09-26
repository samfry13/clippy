import { S3Client } from "@aws-sdk/client-s3";
import { NodeJsClient } from "@smithy/types";
import { env } from "../env.mjs";

type Client = NodeJsClient<S3Client>;
declare global {
  var s3: Client | undefined;
}

const client =
  global.s3 ||
  (new S3Client({
    region: env.AWS_BUCKET_REGION || "auto",
    endpoint: env.AWS_ENDPOINT,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_ACCESS_KEY_SECRET,
    },
  }) as Client);

export default client;

if (process.env.NODE_ENV !== "production") {
  global.s3 = client;
}

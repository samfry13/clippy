import { S3Client } from "@aws-sdk/client-s3";
import { NodeJsClient } from "@smithy/types";
import { z } from "zod";

const ConfigSchema = z.object({
  endpoint: z.string(),
  accessKeyId: z.string(),
  accessKeySecret: z.string(),
  region: z.string().optional(),
});

const configParseResult = ConfigSchema.safeParse({
  endpoint: process.env.AWS_ENDPOINT,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  accessKeySecret: process.env.AWS_ACCESS_KEY_SECRET,
  region: process.env.AWS_BUCKET_REGION,
});

type Client = NodeJsClient<S3Client>;
declare global {
  var s3: Client | undefined;
}

type Result =
  | {
      client: Client;
      enabled: true;
    }
  | {
      client: undefined;
      enabled: false;
    };

const client = configParseResult.success
  ? global.s3 ||
    (new S3Client({
      region: configParseResult.data.region || "auto",
      endpoint: configParseResult.data.endpoint,
      credentials: {
        accessKeyId: configParseResult.data.accessKeyId,
        secretAccessKey: configParseResult.data.accessKeySecret,
      },
    }) as Client)
  : undefined;

const enabled = configParseResult.success;

export default {
  client,
  enabled,
} as Result;

if (process.env.NODE_ENV !== "production") {
  global.s3 = client;
}

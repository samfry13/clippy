import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // DB Vars
    DATABASE_URL: z.string(),

    // Next Auth Vars
    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(1),

    // Email Auth Vars
    EMAIL_SERVER_HOST: z.string().min(1),
    EMAIL_SERVER_PORT: z.string().min(1),
    EMAIL_SERVER_USER: z.string().min(1),
    EMAIL_SERVER_PASSWORD: z.string().min(1),
    EMAIL_FROM: z.string().min(1),

    // Discord Auth Vars
    DISCORD_CLIENT_ID: z.string().min(1),
    DISCORD_CLIENT_SECRET: z.string().min(1),

    // S3 file saving
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_ACCESS_KEY_SECRET: z.string().min(1),
    AWS_BUCKET_REGION: z.string().optional(),
    AWS_BUCKET_NAME: z.string().min(1),
    AWS_ENDPOINT: z.string().url(),
    AWS_PUBLIC_ENDPOINT: z.string().url(),

    // Client file uploading
    MAX_UPLOAD_SIZE: z.string().optional(),
    MAX_CHUNK_SIZE: z.string().optional(),
  },
});

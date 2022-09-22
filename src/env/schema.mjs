// @ts-check
import { z } from 'zod';

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
  DATA_DIR: z.string(),
  DATABASE_URL: z.string().url(),
  FFMPEG_THREADS: z.string(),
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_WHITELIST: z.string().optional(),
  EMAIL_SERVER_HOST: z.string(),
  EMAIL_SERVER_USER: z.string(),
  EMAIL_SERVER_PASSWORD: z.string(),
  EMAIL_SERVER_PORT: z.string(),
  EMAIL_FROM: z.string().email(),
});

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
  NEXT_PUBLIC_MAX_UPLOAD_SIZE: z.number(),
  NEXT_PUBLIC_MAX_CHUNK_SIZE: z
    .number()
    .refine(
      (data) => data % 256 === 0,
      'Max chunk size must be divisible by 256',
    )
    .optional(),
});

/**
 * You can't destruct `process.env` as a regular object, so you have to do
 * it manually here. This is because Next.js evaluates this at build time,
 * and only used environment variables are included in the build.
 * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
 */
export const clientEnv = {
  NEXT_PUBLIC_MAX_UPLOAD_SIZE: parseInt(
    String(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE),
  ),
  NEXT_PUBLIC_MAX_CHUNK_SIZE: process.env.NEXT_PUBLIC_MAX_CHUNK_SIZE
    ? parseInt(String(process.env.NEXT_PUBLIC_MAX_CHUNK_SIZE))
    : undefined,
};

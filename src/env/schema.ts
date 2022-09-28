import { z } from 'zod';

export const serverSchema = {
  NODE_ENV: z.enum(['development', 'test', 'production']),
  DATA_DIR: z.string(),
  FFMPEG_THREADS: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((arg) => arg >= 0, 'Must be a non-negative number')
    .optional(),
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_WHITELIST: z
    .string()
    .transform((arg) => arg.split(','))
    .optional(),
  EMAIL_SERVER_HOST: z.string(),
  EMAIL_SERVER_USER: z.string(),
  EMAIL_SERVER_PASSWORD: z.string(),
  EMAIL_SERVER_PORT: z.string().regex(/^\d+$/).transform(Number),
  EMAIL_FROM: z.string().email(),
};

export const publicSchema = {
  MAX_UPLOAD_SIZE: z.string().regex(/^\d+$/).transform(Number).optional(),
  MAX_CHUNK_SIZE: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((arg) => arg % 256 === 0, 'Must be divisible by 256')
    .optional(),
};

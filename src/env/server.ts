import { serverSchema } from './schema';
import { formatErrors } from './client';
import { z } from 'zod';

type ReturnValue<T extends keyof typeof serverSchema> = z.infer<
  typeof serverSchema[T]
>;

export const env = <T extends keyof typeof serverSchema>(
  arg: T,
): ReturnValue<T> => {
  const result = serverSchema[arg].safeParse(process.env[arg]);

  if (!result.success) {
    console.error(
      '❌ Invalid environment variable:\n',
      ...formatErrors(result.error.format()),
    );
    throw new Error('Invalid environment variable');
  }

  return result.data;
};

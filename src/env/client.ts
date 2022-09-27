import { z } from 'zod';
import { publicSchema } from './schema';

declare global {
  // eslint-disable-next-line no-var
  interface Window {
    __env: any;
  }
}

export const formatErrors = (
  errors: z.ZodFormattedError<Map<string, string>, string>,
) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && '_errors' in value)
        return `${name}: ${value._errors.join(', ')}\n`;
    })
    .filter(Boolean);

type ReturnValue<T extends keyof typeof publicSchema> = z.infer<
  typeof publicSchema[T]
>;

export const env = <T extends keyof typeof publicSchema>(
  arg: T,
): ReturnValue<T> => {
  const result = publicSchema[arg].safeParse(window.__env[arg]);

  if (!result.success) {
    console.error(
      '❌ Invalid environment variable:\n',
      ...formatErrors(result.error.format()),
    );
    throw new Error('Invalid environment variable');
  }

  return result.data;
};

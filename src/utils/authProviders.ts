import { env } from 'env/server';
import EmailProvider from 'next-auth/providers/email';
import DiscordProvider from 'next-auth/providers/discord';

function checkEnv<T>(arg: T | undefined): arg is T {
  return Boolean(arg);
}

export const getEmailProvider = () => {
  const host = env('EMAIL_SERVER_HOST');
  const port = env('EMAIL_SERVER_PORT');
  const user = env('EMAIL_SERVER_USER');
  const pass = env('EMAIL_SERVER_PASSWORD');
  const from = env('EMAIL_FROM');

  if (
    checkEnv(host) &&
    checkEnv(port) &&
    checkEnv(user) &&
    checkEnv(pass) &&
    checkEnv(from)
  ) {
    return EmailProvider({
      server: {
        host,
        port,
        auth: {
          user,
          pass,
        },
      },
      from,
    });
  }

  return undefined;
};

export const getDiscordProvider = () => {
  const clientId = env('DISCORD_CLIENT_ID');
  const clientSecret = env('DISCORD_CLIENT_SECRET');

  if (checkEnv(clientId) && checkEnv(clientSecret)) {
    return DiscordProvider({
      clientId,
      clientSecret,
    });
  }

  return undefined;
};

import NextAuth, { type NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import DiscordProvider from 'next-auth/providers/discord';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from 'server/db/client';
import { env } from 'env/server';

export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    signIn(props) {
      const { user } = props;
      const whitelist = env('NEXTAUTH_WHITELIST');
      if (whitelist && user.email) {
        return whitelist.includes(user.email);
      }

      return true;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: env('EMAIL_SERVER_HOST'),
        port: env('EMAIL_SERVER_PORT'),
        auth: {
          user: env('EMAIL_SERVER_USER'),
          pass: env('EMAIL_SERVER_PASSWORD'),
        },
      },
      from: env('EMAIL_FROM'),
    }),
    DiscordProvider({
      clientId: env('DISCORD_CLIENT_ID'),
      clientSecret: env('DISCORD_CLIENT_SECRET'),
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
};

export default NextAuth(authOptions);

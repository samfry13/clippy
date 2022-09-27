import NextAuth, { type NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
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
    signIn({ user, email }) {
      const whitelist = env('NEXTAUTH_WHITELIST');
      if (whitelist && email.verificationRequest && user.email) {
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
  ],
};

export default NextAuth(authOptions);

import NextAuth, { type NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from 'server/db/client';
import { env } from 'env/server';
import { getDiscordProvider, getEmailProvider } from 'utils/authProviders';

// check provider env vars
const emailProvider = getEmailProvider();
const discordProvider = getDiscordProvider();

const providers = [
  ...(emailProvider ? [emailProvider] : []),
  ...(discordProvider ? [discordProvider] : []),
];

if (providers.length < 1) {
  throw new Error('Must have at least one sign in provider set up');
}

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
  providers,
  pages: {
    signIn: '/auth/signin',
  },
};

export default NextAuth(authOptions);

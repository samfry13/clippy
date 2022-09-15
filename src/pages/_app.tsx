// src/pages/_app.tsx
import type { AppType } from 'next/dist/shared/lib/utils';
import { SessionProvider } from 'next-auth/react';
import '../styles/global.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SnackbarProvider } from 'notistack';

const queryClient = new QueryClient();

const MyApp: AppType = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider autoHideDuration={2000}>
          <Component {...pageProps} />
        </SnackbarProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default MyApp;

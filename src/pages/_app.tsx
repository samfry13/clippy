// src/pages/_app.tsx
import type { AppType } from 'next/dist/shared/lib/utils';
import { SessionProvider } from 'next-auth/react';
import '../styles/global.css';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { SnackbarProvider } from 'notistack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useState } from 'react';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const MyApp: AppType = ({
  Component,
  pageProps: { session, dehydratedState, ...pageProps },
}) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={dehydratedState}>
          <ThemeProvider theme={darkTheme}>
            <SnackbarProvider autoHideDuration={2000}>
              <CssBaseline />
              <Component {...pageProps} />
            </SnackbarProvider>
          </ThemeProvider>
        </Hydrate>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default MyApp;

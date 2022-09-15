// src/pages/_app.tsx
import type { AppType } from 'next/dist/shared/lib/utils';
import { SessionProvider } from 'next-auth/react';
import '../styles/global.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SnackbarProvider } from 'notistack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const queryClient = new QueryClient();

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const MyApp: AppType = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={darkTheme}>
          <SnackbarProvider autoHideDuration={2000}>
            <CssBaseline />
            <Component {...pageProps} />
          </SnackbarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default MyApp;

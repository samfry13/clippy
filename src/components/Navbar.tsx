import {
  AppBar,
  Button,
  CircularProgress,
  Toolbar,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { useIsFetching } from 'react-query';

const Navbar = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const isFetching = useIsFetching();

  return (
    <nav>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => router.push('/')}
          >
            Clippy
          </Typography>
          {isFetching ? <CircularProgress size={20} /> : null}
          {session?.user && (
            <Button
              color="inherit"
              onClick={() => {
                signOut();
              }}
            >
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </nav>
  );
};

export default Navbar;

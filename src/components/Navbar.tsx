import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';

const Navbar = () => {
  const router = useRouter();
  const { data: session } = useSession();

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

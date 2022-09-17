import {
  AppBar,
  Button,
  CircularProgress,
  Toolbar,
  Link as MuiLink,
} from '@mui/material';
import { signOut, useSession } from 'next-auth/react';
import { useIsFetching } from 'react-query';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  const { data: session } = useSession();
  const isFetching = useIsFetching();

  return (
    <nav>
      <AppBar position="static">
        <Toolbar>
          <Image src="/clippy-icon.svg" width={32} height={32} />
          <Link href="/" passHref>
            <MuiLink
              color="inherit"
              underline="none"
              variant="h6"
              sx={{ marginLeft: 1 }}
            >
              Clippy
            </MuiLink>
          </Link>
          <div style={{ flexGrow: 1 }} />
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

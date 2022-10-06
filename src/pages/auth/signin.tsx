import {
  Button,
  Container,
  Card,
  Divider,
  List,
  ListItem,
  CardMedia,
  Input,
  InputAdornment,
} from '@mui/material';
import Head from 'next/head';
import PageContainer from 'components/PageContainer';
import { getProviders, signIn } from 'next-auth/react';
import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from 'pages/api/auth/[...nextauth]';
import EmailIcon from '@mui/icons-material/Email';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions,
  );

  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const providers = await getProviders();

  return {
    props: {
      providers,
    },
  };
};

const Signin = ({
  providers,
}: {
  providers: Awaited<ReturnType<typeof getProviders>>;
}) => {
  const [email, setEmail] = useState('');

  return (
    <>
      <Head>
        <title>Clippy - Signin</title>
      </Head>

      <PageContainer>
        <Container sx={{ mt: '15vh' }}>
          <CardMedia
            sx={{ maxWidth: 200, m: 'auto', mb: 2 }}
            component="img"
            image="/clippy-icon.svg"
          />
          <Card sx={{ m: 'auto', maxWidth: 350 }}>
            <List>
              <ListItem>
                <Input
                  startAdornment={
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  }
                  fullWidth
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </ListItem>
              <ListItem>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => signIn('email', { email })}
                  sx={{
                    '&': {
                      backgroundColor: '#FFF',
                      color: '#000',
                    },
                    '&:hover': {
                      backgroundColor: '#DDD',
                    },
                  }}
                >
                  Submit
                </Button>
              </ListItem>
              {providers &&
                Object.keys(providers).includes('email') &&
                Object.keys(providers).length > 1 && (
                  <Divider component="li" sx={{ my: 2, mx: 2 }}>
                    Sign in with
                  </Divider>
                )}
              {providers &&
                Object.entries(providers)
                  .filter(([key]) => key !== 'email')
                  .map(([key, provider]) => (
                    <ListItem key={key}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => signIn(provider.id)}
                        classes={{
                          root: provider.id,
                        }}
                      >
                        {provider.name}
                      </Button>
                    </ListItem>
                  ))}
            </List>
          </Card>
        </Container>
      </PageContainer>
    </>
  );
};

export default Signin;

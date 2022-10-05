import {
    Button,
    Container,
    Card,
    Divider,
    Input,
    InputAdornment,
    List,
    ListItem,
    CardMedia,
    Paper
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import Head from 'next/head';
import PageContainer from 'components/PageContainer';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

const Signin = () => {
    const [email, setEmail] = useState("")
    
    return (
        <>
            <Head>
            <title>Clippy</title>
            <meta name="description" content="Self-hosted clips" />
            <link
                rel="icon"
                type="image/png"
                sizes="48x48"
                href="/favicon-48x48.png"
            />
            <link
                rel="icon"
                type="image/png"
                sizes="96x96"
                href="/favicon-96x96.png"
            />
            <link
                rel="icon"
                type="image/png"
                sizes="144x144"
                href="/favicon-144x144.png"
            />
            <link
                rel="icon"
                type="image/png"
                sizes="192x192"
                href="/favicon-192x192.png"
            />
            </Head>

            <PageContainer>
                <Container>
                    <Card sx={{ m: "auto", mt: "15vh", maxWidth: 350 }} elevation={1}>
                        
                            <CardMedia
                                sx={{maxWidth: 200, m:"auto", mt: 5, mb: 5, }}
                                component="img"
                                image="/clippy-icon.svg"
                            />
                        <Paper elevation={5}>
                        <List>       
                            <ListItem>
                                <Input
                                    startAdornment={<InputAdornment position="start"><EmailIcon /></InputAdornment>}
                                    required
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
                                    onClick={() => signIn("email", { email: email })}
                                >Submit</Button>
                            </ListItem>
                            <Divider sx={{ m: 2 }} variant="middle" component="li"/>
                            <ListItem>
                                <Button
                                    variant="contained"
                                    fullWidth                                    
                                    onClick={() => signIn("discord")}
                                    >Sign in with Discord</Button>
                            </ListItem>
                        </List>
                        </Paper>
                    </Card>
                </Container>
            </PageContainer>
        </>
    );
}

export default Signin;
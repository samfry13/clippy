# What is Clippy?
Clips is a self-hosted streamable alternative

# Usage
### docker-compose (recommended)

```yaml
version: "3"
services:
  clippy:
    image: samfry13/clips:latest
    container_name: clippy
    environment:
      PUID: "1000"
      PGID: "1000"
      TZ: "America/Chicago"
      INIT_DB: "true"
      NEXTAUTH_SECRET: "changeme"
      NEXTAUTH_URL: "https://your.site.here"
      NEXTAUTH_WHITELIST: "user1@example.com,user2@example.com"
      EMAIL_SERVER_HOST: "smtp.gmail.com"
      EMAIL_SERVER_USER: "example@gmail.com"
      EMAIL_SERVER_PASSWORD: "examplepassword"
      EMAIL_SERVER_PORT: "587"
      EMAIL_FROM: "example@gmail.com"
    volumes:
      - /path/to/data:/data
    ports:
      - 3000:3000
    restart: unless-stopped
```

## Environment Variables
### General Variables
| Variable | Function |
| :----: | --- |
| `PUID ` | This will set the user ID |
| `PGID ` | This will set the group ID |
| `TZ` | This will set the timezone of the server |

### Database Variables
| Variable | Function |
| :----: | --- |
| `DATABASE_URL` | This is used to set the file location for your `.db` file |
| `INIT_DB` | This defaults to `true` and is used to set up schemas in your `.db` file |

### Auth Variables
This project uses email authentication through [NextAuth.js](https://next-auth.js.org/) to set up registered users who can upload videos.

| Variable | Function |
| :----: | --- |
| `NEXTAUTH_SECRET` | This will set the secret for encrypting user tokens in the db. |
| `NEXTAUTH_URL` | This sets the url that the api can redirect back to after email authentication. Should just be the origin (i.e. `https://www.example.com`) |
| `NEXTAUTH_WHITELIST` | This image limits access of users to a whitelisted set of emails. This is a comma separated list of emails who are allowed to sign up |

### Email Variables
| Variable | Function |
| :----: | --- |
| `EMAIL_SERVER_HOST` | The email server host name (i.e. `smtp.gmail.com`) |
| `EMAIL_SERVER_USER` | The username to login to the email server host |
| `EMAIL_SERVER_PASSWORD` | The password to login to the email server host |
| `EMAIL_SERVER_PORT` | The port to connect to the email server on |
| `EMAIL_FROM ` | What email to send the login emails from (i.e. `no-reply@example.com`) |

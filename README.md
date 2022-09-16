# What is Clippy?

Clippy is a self-hosted streamable alternative

# Usage

### docker-compose (recommended)

```yaml
version: '3'
services:
  clippy:
    image: samfry13/clippy:latest
    container_name: clippy
    environment:
      PUID: '1000'
      PGID: '1000'
      INIT_DB: 'true'
      NEXTAUTH_SECRET: 'changeme'
      NEXTAUTH_URL: 'https://your.site.here'
      NEXTAUTH_WHITELIST: 'user1@example.com,user2@example.com'
      EMAIL_SERVER_HOST: 'smtp.gmail.com'
      EMAIL_SERVER_USER: 'example@gmail.com'
      EMAIL_SERVER_PASSWORD: 'examplepassword'
      EMAIL_SERVER_PORT: '587'
      EMAIL_FROM: 'example@gmail.com'
    volumes:
      - /path/to/data:/data
    ports:
      - 3000:3000
    restart: unless-stopped
```

## Environment Variables

### General Variables

|           Variable            |  Default  | Required | Function                                      |
| :---------------------------: | :-------: | :------: | --------------------------------------------- |
|            `PUID`             |   1000    | ❌       | The user ID to run the app as                 |
|            `PGID`             |   1000    | ❌       | The group ID to run the app as                |
|            `PORT`             |   3000    | ❌       | The port the app exposes inside the container |
| `NEXT_PUBLIC_MAX_UPLOAD_SIZE` | 104857600 | ❌       | The max upload file size in bytes             |

### Database Variables

|    Variable    |      Default      | Required | Function                                                          |
| :------------: | :---------------: | :------: | ----------------------------------------------------------------- |
| `DATABASE_URL` | file:/data/app.db | ❌       | The file location for your `.db` file or the URL to your database |
|   `INIT_DB`    |       true        | ❌       | This is used to set up schemas in your `.db` file                 |

### Auth Variables

This project uses email authentication through [NextAuth.js](https://next-auth.js.org/) to set up registered users who can upload videos.

|       Variable       | Default | Required | Function                                                                                                                              |
| :------------------: | :-----: | :------: | ------------------------------------------------------------------------------------------------------------------------------------- |
|  `NEXTAUTH_SECRET`   |    -    | ✅       | The secret for encrypting user tokens in the db                                                                                       |
|    `NEXTAUTH_URL`    |    -    | ✅       | The url that the api can redirect back to after email authentication. Should just be the origin (i.e. `https://www.example.com`)      |
| `NEXTAUTH_WHITELIST` |    -    | ❌       | This image limits access of users to a whitelisted set of emails. This is a comma separated list of emails who are allowed to sign up |

### Email Variables

|        Variable         | Default | Required | Function                                                               |
| :---------------------: | :-----: | :------: | ---------------------------------------------------------------------- |
|   `EMAIL_SERVER_HOST`   |    -    | ✅       | The email server host name (i.e. `smtp.gmail.com`)                     |
|   `EMAIL_SERVER_USER`   |    -    | ✅       | The username to login to the email server host                         |
| `EMAIL_SERVER_PASSWORD` |    -    | ✅       | The password to login to the email server host                         |
|   `EMAIL_SERVER_PORT`   |    -    | ✅       | The port to connect to the email server on                             |
|      `EMAIL_FROM`       |    -    | ✅       | What email to send the login emails from (i.e. `no-reply@example.com`) |

## Running Locally

To build and run locally follow these steps:

Clone the repo using `git clone https://github.com/samfry13/clippy.git`

Install dependencies using `npm install`

Copy the `.env.example` into a `.env` file, and make sure all environment variables are set to specifications above (should error if not set correctly). Make sure to set the `DATA_DIR` and `DATABASE_URL` to a location you have control over. Usually in the repo itself.

Create and update .db file using `npx prisma db push`

Run the development server with `npm run dev`

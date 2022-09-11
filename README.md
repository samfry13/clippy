# What is Clips?
Clips is a self-hosted streamable alternative

# Environment Variables
There are several environment variables that need to be set in order for this image to run properly.

## Database Variables
### `DATABASE_URL`
This is used to set the file location for your `.db` file
### `INIT_DB`
This defaults to `true` and is used to set up schemas in your `.db` file
## Auth Variables
This project uses email authentication through [NextAuth.js](https://next-auth.js.org/) to set up registered users who can upload videos.
### `NEXTAUTH_SECRET`
This will set the secret for encrypting user tokens in the db
### `NEXTAUTH_URL`
This sets the url that the api can redirect back to after email authentication. Should just be the origin (i.e. `https://www.example.com`)
### `NEXTAUTH_WHITELIST`
This image limits access of users to a whitelisted set of emails. This is a comma separated list of emails who are allowed to sign up
`user1@example.com,user2@example.com,user3...`
## Email Variables
Because this image uses email authentication, you will need an email service to send emails through.
### `EMAIL_SERVER_HOST`
The email server host name (i.e. `smtp.gmail.com`)
### `EMAIL_SERVER_USER` and `EMAIL_SERVER_PASSWORD`
The username and password to login to the email server host
### `EMAIL_SERVER_PORT`
The port to connect to the email server on
### `EMAIL_FROM`
What email to send the login emails from (i.e. `no-reply@example.com`)
## Misc Variables
### `PUID` and `PGID`
These will set the user id and group id that the server runs on
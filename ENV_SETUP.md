# Environment Setup

Private values are stored in `.env` files and ignored by git. Share `.env.example` files instead.

## Backend

Set the variables from `.env.example` in your hosting provider:

- `CONFIG_SERVER_URL`
- `CONFIG_REPOSITORY_LOCATION`
- `EUREKA_DEFAULT_ZONE`
- `EUREKA_HOSTNAME`
- `APP_CORS_ALLOWED_ORIGINS`
- `DB_USERNAME`
- `DB_PASSWORD`
- `USERSERVICE_DB_URL`
- `TRAINSERVICE_DB_URL`
- `RESERVATIONSERVICE_DB_URL`
- `PAYMENTSERVICE_DB_URL`
- `STRIPE_SECRET_KEY`
- `PAYMENT_GATEWAY`
- `PAYMENT_SUCCESS_URL`
- `PAYMENT_CANCEL_URL`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_SMTP_SSL_TRUST`
- `MAIL_TEST_CONNECTION`

For local Spring Boot runs, the services import the root `.env` automatically when run from the repository root or from each service directory.

## Frontend

The Vite frontend reads `railway-frontend/.env`.

For deployment, set:

- `VITE_API_BASE_URL`

Use your deployed API Gateway URL as the value.

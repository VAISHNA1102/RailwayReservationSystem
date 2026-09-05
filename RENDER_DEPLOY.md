# Render Deployment

This project is configured for Render with `render.yaml`.

## 1. Push To GitHub

Commit and push the repository to GitHub/GitLab/Bitbucket. Do not commit `.env` files.

## 2. Create MySQL

This app uses MySQL. Render can run MySQL as a Docker private service with a persistent disk, or you can use an external MySQL provider.

Create these databases:

- `userservicetrain`
- `trainservicetrain`
- `reservationservicetrain`
- `paymentservicetrain`

Your JDBC URLs should look like:

```text
jdbc:mysql://MYSQL_HOST:3306/userservicetrain?createDatabaseIfNotExist=true
jdbc:mysql://MYSQL_HOST:3306/trainservicetrain?createDatabaseIfNotExist=true
jdbc:mysql://MYSQL_HOST:3306/reservationservicetrain?createDatabaseIfNotExist=true
jdbc:mysql://MYSQL_HOST:3306/paymentservicetrain?createDatabaseIfNotExist=true
```

## 3. Create The Blueprint

In Render:

1. Open the Render Dashboard.
2. Click New.
3. Choose Blueprint.
4. Connect this repository.
5. Select the root `render.yaml`.
6. Render will ask for secret values marked `sync: false`.

Enter:

- `DB_USERNAME`
- `DB_PASSWORD`
- `USERSERVICE_DB_URL`
- `TRAINSERVICE_DB_URL`
- `RESERVATIONSERVICE_DB_URL`
- `PAYMENTSERVICE_DB_URL`
- `STRIPE_SECRET_KEY`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`

## 4. First Deploy Order

The Blueprint creates all services together. If some services fail on the first deploy because Eureka or Config Server was still starting, redeploy in this order:

1. `railway-eureka-server`
2. `railway-config-server`
3. `railway-user-service`
4. `railway-train-service`
5. `railway-payment-service`
6. `railway-reservation-service`
7. `railway-api-gateway`
8. `railway-frontend`

## 5. Update Render URLs

After Render creates the services, confirm the public URLs. If Render changes the frontend or API Gateway subdomain, update:

- Frontend service: `VITE_API_BASE_URL`
- API Gateway service: `APP_CORS_ALLOWED_ORIGINS`
- Payment service: `PAYMENT_SUCCESS_URL`
- Payment service: `PAYMENT_CANCEL_URL`

Then redeploy those services.

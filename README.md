## ProofPass Next

ProofPass Next is a fresh `Next.js App Router + TypeScript + Tailwind CSS` rebuild of the original static ProofPass prototype, aligned to the `ProofPass_Blueprint_v2.pdf` architecture.

The current repo includes:

- Rebuilt marketing landing page
- Organizer dashboard surface
- Certificate issue screen
- Public verify page with active, revoked, and not-found demo states
- Public project portfolio page
- Blueprint-aligned `lib`, `types`, MongoDB-backed data access, and API route scaffolding

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file from the example:

```bash
cp env.example .env
```

3. Set the required values in `.env`:

- `MONGODB_URI` should point to your local or remote MongoDB instance
- `MONGODB_DB` defaults to `proofpass`
- `AUTH_SECRET` must be set before starting the app

4. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

If you want demo credentials for local testing, set the `TEST_*` variables in `.env` and run:

```bash
npm run seed:test-users
```

## Environment Variables

Use `env.example` as the reference file for required production values.

- `APP_URL` must be the public HTTPS URL of the deployed app.
- `AUTH_SECRET` must be a strong random secret.
- `MONGODB_URI` should point to your production MongoDB instance.
- `MONGODB_DB` is optional if the database name is already included in `MONGODB_URI`.
- `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` are only for one-time admin creation during deployment.
- Remove `BOOTSTRAP_ADMIN_PASSWORD` from the environment after the admin account has been created.

## Deploy with Docker

Build and run with Docker Compose:

```bash
cp env.example .env
docker compose up -d --build
```

To create only the initial admin account during deployment:

```bash
npm run seed:admin
```

This script creates or updates a `super_admin` user from `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD`. It does not require organizer credentials.

The repo now includes:

- `Dockerfile` for a production Next.js standalone image
- `docker-compose.yml` with the app service configured for an external MongoDB instance
- `.dockerignore` for smaller builds

For Coolify, do not publish the app with a host `ports:` mapping in Compose. Coolify handles the external routing itself.

## Coolify

For Coolify self-hosting:

- Use the included `Dockerfile` or `docker-compose.yml`
- Set the same environment variables from `env.example` in the Coolify UI
- Point `MONGODB_URI` to your existing MongoDB deployment
- Put a reverse proxy and TLS in front of the app, and set `APP_URL` to that public domain

## Current Scope

This pass ports the design into the requested stack and lays down the correct folder structure, demo data, validation, and MongoDB-backed auth/data baseline. The UI is demo-ready, but some flows still use a lightweight compatibility facade over the existing page/action code instead of a fully custom Mongo repository layer.

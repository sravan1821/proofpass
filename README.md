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

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo Routes

- `/`
- `/dashboard`
- `/dashboard/certificates/new`
- `/verify/active-demo-token`
- `/verify/revoked-demo-token`
- `/verify/not-found-demo-token`
- `/project/proofpass`

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the MongoDB values.

## Test Credentials

To create local test login accounts in MongoDB:

```bash
npm run seed:test-users
```

This script requires:

- `MONGODB_URI`
- `AUTH_SECRET`

Default seeded credentials:

- Admin: `admin@proofpass.local` / `ProofPass123!`
- Organizer: `organizer@proofpass.local` / `ProofPass123!`

## Current Scope

This pass ports the design into the requested stack and lays down the correct folder structure, demo data, validation, and MongoDB-backed auth/data baseline. The UI is demo-ready, but some flows still use a lightweight compatibility facade over the existing page/action code instead of a fully custom Mongo repository layer.

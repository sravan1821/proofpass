## ProofPass Next

ProofPass Next is a fresh `Next.js App Router + TypeScript + Tailwind CSS` rebuild of the original static ProofPass prototype, aligned to the `ProofPass_Blueprint_v2.pdf` architecture.

The current repo includes:

- Rebuilt marketing landing page
- Organizer dashboard surface
- Certificate issue screen
- Public verify page with active, revoked, and not-found demo states
- Public project portfolio page
- Blueprint-aligned `lib`, `types`, `supabase`, and API route scaffolding

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

Copy `.env.example` to `.env.local` and fill in the values when you connect Supabase and Resend.

## Current Scope

This pass ports the design into the requested stack and lays down the correct folder structure, demo data, validation, and SQL schema baseline. The UI is demo-ready, but the Supabase writes, auth, storage, and email delivery are still scaffolded rather than fully wired.

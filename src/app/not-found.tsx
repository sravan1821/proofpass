import Link from "next/link";

import { AppShell } from "@/components/shared/shell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <AppShell>
      <section className="mx-auto flex max-w-3xl flex-col items-start px-6 py-24">
        <p className="text-xs uppercase tracking-[0.26em] text-[color:var(--muted-foreground)]">Not found</p>
        <h1 className="mt-4 text-5xl font-semibold text-white">The requested ProofPass page does not exist.</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[color:var(--muted-foreground)]">
          Use the seeded demo routes to review the rebuilt project: landing, dashboard, issue flow, verify, and project portfolio.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/">
            <Button>Back home</Button>
          </Link>
          <Link href="/verify/not-found-demo-token">
            <Button variant="secondary">Open not-found verify state</Button>
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

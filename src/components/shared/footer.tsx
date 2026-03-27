export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[color:var(--surface)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-[color:var(--muted-foreground)] md:flex-row md:items-center md:justify-between">
        <p>ProofPass v2 demo scaffold built on Next.js App Router, TypeScript, Tailwind, and shadcn-style components.</p>
        <p>Prepared for the HackFusion 2026 blueprint flow.</p>
      </div>
    </footer>
  );
}

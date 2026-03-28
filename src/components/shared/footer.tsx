import Link from "next/link";

const footerLinks = [
  { href: "/sign-in", label: "Sign In" },
  { href: "/register", label: "Register" },
  { href: "/verify/active-demo-token", label: "Verify" },
  { href: "/admin/login", label: "Admin" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[color:var(--surface)]/92">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_auto] lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">ProofPass</p>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
            ProofPass v2 demo scaffold built on Next.js App Router, TypeScript, Tailwind, and shadcn-style components.
          </p>
          <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Prepared for the HackFusion 2026 blueprint flow.</p>
        </div>

        <div className="flex flex-col gap-5 lg:items-end">
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[color:var(--muted-foreground)]">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
            © {new Date().getFullYear()} ProofPass. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

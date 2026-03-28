import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

const VERIFY_HREF = "/verify/active-demo-token";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/certificates/new", label: "Issue" },
  { href: VERIFY_HREF, label: "Verify" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[color:var(--surface-2)]/78 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(92,236,255,0.24),rgba(83,103,255,0.88)_48%,rgba(255,186,92,0.22))] shadow-[0_20px_40px_rgba(44,99,255,0.28)]">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.34em] text-[color:var(--muted-foreground)]">ProofPass</div>
            <div className="text-base font-semibold tracking-[-0.03em] text-white sm:text-lg">Verified talent passport</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-[color:var(--muted-foreground)] lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="hidden text-sm text-[color:var(--muted-foreground)] transition hover:text-white md:inline-flex">
            Sign In
          </Link>
          <Link href="/dashboard/certificates/new">
            <Button size="sm" className="rounded-full px-4">
              Issue Certificate
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

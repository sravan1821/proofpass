import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/certificates/new", label: "Issue" },
  { href: "/verify/active-demo-token", label: "Verify" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[color:var(--surface-2)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,#818cf8,#312e81)] shadow-[0_14px_35px_rgba(79,70,229,0.35)]">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">ProofPass</div>
            <div className="text-lg font-semibold text-white">Verified talent passport</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-[color:var(--muted-foreground)] md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/dashboard/certificates/new">
          <Button size="sm">Issue Certificate</Button>
        </Link>
      </div>
    </header>
  );
}

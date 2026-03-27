import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  FileText,
  Layers3,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const verifyHref = "/verify/active-demo-token";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/certificates/new", label: "Issue" },
  { href: verifyHref, label: "Verify" },
];

const stats = [
  { value: "< 3s", label: "Verification Time" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "14+", label: "Form Field Types" },
  { value: "3", label: "Certificate Tiers" },
];

const features = [
  {
    Icon: ShieldCheck,
    title: "Tamper-Proof Certificates",
    desc: "Every certificate carries a unique ID and embedded QR code. Verification happens in real-time - no calls, no emails, no guesswork.",
  },
  {
    Icon: FileText,
    title: "Dynamic Form Builder",
    desc: "Collect participant data with a drag-and-drop form builder inspired by Google Forms. 14+ field types, real-time preview, zero learning curve.",
  },
  {
    Icon: Award,
    title: "Achievement-Based Templates",
    desc: "Distinct certificate designs for Winners, Runners-Up, and Participants. Every achievement level gets the recognition it deserves.",
  },
  {
    Icon: BadgeCheck,
    title: "Curated Trust Model",
    desc: "Every organizer is vetted and approved before they can issue certificates. No unverified issuers, no credential fraud.",
  },
];

const steps = [
  {
    num: "01",
    title: "Register & Get Approved",
    desc: "Submit your organization details. Our team verifies and approves your account within 24 hours.",
  },
  {
    num: "02",
    title: "Create Events & Collect Data",
    desc: "Set up your event, build registration forms, and collect participant data - all in one place.",
  },
  {
    num: "03",
    title: "Issue Verified Certificates",
    desc: "Categorize participants, configure templates, and issue tamper-evident certificates with unique QR codes in bulk.",
  },
];

function HeroPreview() {
  return (
    <div className="animate-hero-reveal relative mx-auto mt-14 w-full max-w-5xl rounded-[0.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,14,28,0.95),rgba(8,10,20,0.98))] p-4 shadow-[0_32px_110px_rgba(4,7,19,0.55)] [animation-delay:260ms] [animation-fill-mode:both] sm:p-6">
      <div className="absolute inset-0 rounded-[0.9rem] bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_25%)]" />
      <div className="relative">
        <div className="flex items-center justify-between rounded-[0.75rem] border border-white/8 bg-white/[0.04] px-4 py-3">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
              Live Trust Surface
            </p>
            <p className="mt-1 text-sm font-medium text-white">Real-time certificate verification</p>
          </div>
          <div className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
            Active
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[0.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(20,22,39,0.94),rgba(10,12,23,0.96))] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
                  Certificate Snapshot
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">ProofPass Credential</h3>
              </div>
              <ShieldCheck className="h-8 w-8 text-violet-200" />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[0.65rem] border border-white/7 bg-white/[0.03] p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
                  Unique ID
                </p>
                <p className="mt-3 font-mono text-sm text-white">PP-HF26-0312</p>
              </div>
              <div className="rounded-[0.65rem] border border-white/7 bg-white/[0.03] p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
                  Status
                </p>
                <p className="mt-3 text-sm font-semibold text-emerald-200">Verified</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {["Winner", "Runner-Up", "Participant"].map((tier, index) => (
                <div
                  key={tier}
                  className={cn(
                    "rounded-[0.65rem] border px-3 py-4 text-center",
                    index === 1 ? "border-violet-300/20 bg-violet-400/10" : "border-white/7 bg-white/[0.03]",
                  )}
                >
                  <p className="text-[0.6rem] uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
                    Tier
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">{tier}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="animate-gentle-float rounded-[0.75rem] border border-white/8 bg-white/[0.04] p-5" style={{ animationDelay: "0.4s" }}>
              <div className="flex items-center justify-between">
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
                  Verification Time
                </p>
                <ScanSearch className="h-4 w-4 text-violet-200" />
              </div>
              <p className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">&lt; 3s</p>
              <div className="mt-5 flex gap-2">
                {[60, 78, 52, 84, 66, 88].map((height, index) => (
                  <span
                    key={`${height}-${index}`}
                    className="animate-gentle-float flex-1 rounded-full bg-[linear-gradient(180deg,#b794f6,#6d5cff_55%,rgba(59,130,246,0.25))]"
                    style={{ animationDelay: `${index * 0.18}s` }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>

            <div className="animate-hero-reveal rounded-[0.75rem] border border-white/8 bg-white/[0.04] p-5 [animation-delay:420ms] [animation-fill-mode:both]">
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
                Trust Quote
              </p>
              <p className="mt-4 text-sm leading-7 text-white/88">
                &ldquo;Verification happens in real-time - no calls, no emails, no guesswork.&rdquo;
              </p>
              <div className="mt-5 space-y-2">
                {[78, 92, 66].map((width, index) => (
                  <div key={`${width}-${index}`} className="h-2 rounded-full bg-white/8">
                    <div
                      className="animate-subtle-pan h-full rounded-full bg-[linear-gradient(90deg,#34d399,#38bdf8)]"
                      style={{ width: `${width}%`, animationDelay: `${index * 0.2}s` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-[0.72rem] font-medium uppercase tracking-[0.3em] text-violet-100">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-8 text-[color:var(--muted-foreground)]">{description}</p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(109,92,255,0.16),transparent_28%),radial-gradient(circle_at_85%_14%,rgba(168,85,247,0.12),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_22%)]" />

      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="animate-hero-reveal mx-auto flex max-w-[1100px] items-center justify-between gap-4 rounded-[0.95rem] border border-white/10 bg-[rgba(7,10,19,0.86)] px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl [animation-delay:80ms] [animation-fill-mode:both] sm:px-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[0.8rem] border border-violet-300/20 bg-[radial-gradient(circle,rgba(193,132,252,0.95),rgba(109,92,255,0.28)_45%,rgba(255,255,255,0.04)_70%)] shadow-[0_0_18px_rgba(168,85,247,0.35)]">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[0.62rem] uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">ProofPass</p>
              <p className="text-[0.78rem] font-medium text-white">Verified talent passport</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-[0.92rem] text-[color:var(--muted-foreground)] lg:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="hidden text-[0.9rem] text-[color:var(--muted-foreground)] transition hover:text-white md:inline-flex">
              Sign In
            </Link>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "sm" }),
                "h-10 rounded-[0.7rem] border border-violet-300/18 bg-[linear-gradient(180deg,#8660f5,#6d5cff)] px-4 text-[0.88rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]",
              )}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <div className="h-24 sm:h-28" />

      <section className="mx-auto max-w-7xl px-5 pb-14 pt-8 text-center sm:px-6 sm:pt-10 lg:px-8 lg:pb-18 lg:pt-12">
        <div className="mx-auto max-w-3xl">
          <div className="animate-hero-reveal inline-flex items-center gap-2 rounded-full border border-violet-300/16 bg-violet-400/10 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-violet-100 [animation-delay:120ms] [animation-fill-mode:both]">
            <Sparkles className="h-3.5 w-3.5" />
            Trusted Event Credential Infrastructure
          </div>

          <h1 className="animate-hero-reveal mt-6 text-[clamp(2.5rem,6vw,4.9rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-white [animation-delay:180ms] [animation-fill-mode:both]">
            Every Certificate <span className="text-transparent bg-[linear-gradient(120deg,#ffffff,#9bcfff_45%,#5b7cff)] bg-clip-text">Verified.</span>
            <br />
            Every Achievement <span className="text-transparent bg-[linear-gradient(120deg,#ffd28d,#ff8da1_42%,#b794f6)] bg-clip-text">Recognized.</span>
          </h1>

          <p className="animate-hero-reveal mx-auto mt-6 max-w-2xl text-[1.02rem] leading-8 text-[color:var(--muted-foreground)] [animation-delay:240ms] [animation-fill-mode:both]">
            ProofPass is the end-to-end platform for event credential management - from organizer onboarding and participant registration to tamper-evident certificate issuance with real-time QR-based verification.
          </p>

          <div className="animate-hero-reveal mt-8 flex flex-col items-center justify-center gap-4 [animation-delay:300ms] [animation-fill-mode:both] sm:flex-row">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-[0.85rem] px-7 text-[0.96rem]")}>
              Register as Organizer
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={verifyHref}
              className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "h-12 rounded-[0.85rem] border-white/12 bg-white/[0.05] px-7 text-[0.96rem]")}
            >
              <ScanSearch className="h-4 w-4" />
              Verify a Certificate
            </Link>
          </div>
        </div>

        <HeroPreview />
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-6 lg:px-8 lg:pb-16">
        <div className="grid gap-px overflow-hidden rounded-[0.8rem] border border-white/8 bg-white/10 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-[linear-gradient(180deg,rgba(14,17,31,0.96),rgba(8,10,20,0.94))] px-6 py-7 text-center">
              <p className="text-3xl font-semibold tracking-[-0.04em] text-white">{stat.value}</p>
              <p className="mt-2 text-[0.68rem] uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8 lg:py-18">
        <SectionHeader
          eyebrow="Platform Capabilities"
          title="Built for Trust, Designed for Speed"
          description="Everything event organizers need to issue credentials that employers, universities, and the world can trust."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {features.map(({ Icon, title, desc }, index) => (
            <article
              key={title}
              className="animate-hero-reveal rounded-[0.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(13,15,28,0.96),rgba(8,10,20,0.96))] p-6 transition-transform duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${120 + index * 90}ms`, animationFillMode: "both" }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-[0.7rem] border border-white/10 bg-white/[0.05]">
                <Icon className="h-5 w-5 text-violet-100" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">{desc}</p>
              {index === 0 ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_0.9fr]">
                  <div className="rounded-[0.65rem] border border-white/7 bg-white/[0.04] p-4">
                    <p className="text-[0.65rem] uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
                      Verification Record
                    </p>
                    <div className="mt-4 grid gap-2">
                      {["Unique ID matched", "Issuer approved", "Certificate status active"].map((item) => (
                        <div key={item} className="flex items-center justify-between rounded-[0.55rem] border border-white/7 bg-black/20 px-3 py-2.5">
                          <span className="text-sm text-white/88">{item}</span>
                          <BadgeCheck className="h-4 w-4 text-emerald-200" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[0.65rem] border border-white/7 bg-white/[0.04] p-4">
                    <p className="text-[0.65rem] uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
                      Live Chart
                    </p>
                    <div className="mt-5 flex h-[8.6rem] items-end gap-2">
                      {[36, 68, 52, 80, 64, 94].map((height, barIndex) => (
                        <span
                          key={`${height}-${barIndex}`}
                          className="flex-1 rounded-full bg-[linear-gradient(180deg,#9f7aea,#5b7cff_55%,rgba(56,189,248,0.18))]"
                          style={{ height }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8 lg:py-18">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[0.85rem] border border-white/8 bg-[linear-gradient(180deg,rgba(12,14,28,0.96),rgba(8,10,20,0.98))] p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.3em] text-violet-100">How It Works</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">Three Steps to Verified Credentials</h2>
              </div>
              <Layers3 className="hidden h-6 w-6 text-violet-200 sm:block" />
            </div>

            <div className="mt-8 space-y-4">
              {steps.map((step) => (
                <article key={step.num} className="rounded-[0.65rem] border border-white/7 bg-white/[0.03] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-[0.7rem] border border-violet-300/18 bg-violet-400/10 font-mono text-sm font-medium text-violet-100">
                      {step.num}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--muted-foreground)]">{step.desc}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[0.85rem] border border-white/8 bg-[linear-gradient(180deg,rgba(47,22,82,0.92),rgba(10,12,22,0.98))] p-6 sm:p-8">
            <p className="text-[0.72rem] uppercase tracking-[0.3em] text-violet-100">Trust System</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">Curated approval before issuance.</h3>
            <p className="mt-4 text-sm leading-7 text-violet-100/72">
              Every organizer is vetted and approved before they can issue certificates. No unverified issuers, no credential fraud.
            </p>

            <div className="mt-8 rounded-[0.7rem] border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Organizer approval</span>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                  Approved
                </span>
              </div>
              <div className="mt-6 space-y-3">
                {["Organization details submitted", "Identity reviewed", "Issuance privileges enabled"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-[0.55rem] border border-white/8 bg-white/[0.04] px-4 py-3">
                    <BadgeCheck className="h-4 w-4 text-emerald-200" />
                    <span className="text-sm text-white/88">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8 lg:py-18">
        <div className="grid gap-6 rounded-[0.85rem] border border-white/8 bg-[linear-gradient(180deg,rgba(12,14,28,0.96),rgba(8,10,20,0.98))] p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[0.3em] text-emerald-200">Instant Verification</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">Verify Any Certificate in Seconds</h2>
            <p className="mt-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
              Scan the QR code on any ProofPass certificate or enter the Certificate ID to instantly check its authenticity. No login required.
            </p>

            <div className="mt-8 rounded-[0.7rem] border border-white/8 bg-white/[0.04] p-4">
              <label className="text-[0.68rem] uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
                Certificate ID
              </label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  readOnly
                  value="PP-2025-TF-00001"
                  className="h-12 flex-1 rounded-full border border-white/8 bg-black/20 px-5 text-sm text-white outline-none"
                />
                <Link href={verifyHref} className={cn(buttonVariants(), "h-12 rounded-full px-6")}>
                  Verify
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[0.72fr_1.28fr]">
            <div className="rounded-[0.7rem] border border-white/8 bg-white/[0.04] p-5">
              <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
                Scan Layer
              </p>
              <div className="mt-5 grid place-items-center rounded-[0.6rem] border border-white/7 bg-black/20 px-6 py-8">
                <div className="grid grid-cols-5 gap-1.5 rounded-[0.7rem] border border-white/10 bg-black/25 p-4">
                  {Array.from({ length: 25 }).map((_, index) => (
                    <span
                      key={index}
                      className={cn("h-4 w-4 rounded-[0.25rem]", index % 3 === 0 || index % 7 === 0 ? "bg-white" : "bg-white/10")}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[0.7rem] border border-white/8 bg-white/[0.04] p-5">
              <div className="flex items-center justify-between">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
                  Verification Result
                </p>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                  Authentic
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {["Unique ID matched", "Issuer approved", "Certificate status active", "QR validation completed"].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-[0.55rem] border border-white/8 bg-black/20 px-4 py-3">
                    <span className="text-sm text-white/88">{item}</span>
                    <BadgeCheck className="h-4 w-4 text-emerald-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-22">
        <div className="rounded-[0.85rem] border border-white/8 bg-[linear-gradient(180deg,rgba(53,24,91,0.86),rgba(14,16,31,0.96))] px-6 py-14 text-center sm:px-10">
          <p className="text-[0.72rem] uppercase tracking-[0.3em] text-violet-100">Launch Your Credential Flow</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
            Ready to Issue Trusted Credentials?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[color:var(--muted-foreground)]">
            Join the platform that makes every certificate verifiable and every achievement distinguishable.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8")}>
              Register Your Organization
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard/certificates/new" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "rounded-full px-8")}>
              Issue Certificate
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 text-sm text-[color:var(--muted-foreground)] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">ProofPass</p>
              <p className="text-sm font-medium text-white">Verified talent passport</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <Link href="/sign-in" className="transition hover:text-white">
              Sign In
            </Link>
            <Link href="/register" className="transition hover:text-white">
              Register
            </Link>
            <Link href={verifyHref} className="transition hover:text-white">
              Verify
            </Link>
            <Link href="/admin/login" className="transition hover:text-white">
              Admin
            </Link>
          </div>

          <p>© {new Date().getFullYear()} ProofPass. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

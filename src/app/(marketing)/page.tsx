import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Clock,
  Layers3,
  MapPin,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Tag,
  Users,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QrScanner } from "@/app/verify/qr-scanner";

const verifyHref = "/verify/active-demo-token";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: verifyHref, label: "Verify" },
  { href: "/sign-in", label: "Login" },
];

const sampleEvents = [
  {
    id: "demo-1",
    name: "TechFest 2026",
    description: "A premier tech festival featuring hackathons, workshops, and keynotes from industry leaders.",
    category: "Hackathon",
    startDate: "15 Apr 2026 – 16 Apr",
    time: "9:00 AM - 6:00 PM",
    venue: "JNTU Innovation Hub",
    fee: 299,
    org: "CodeCraft Society",
    advantages: ["Networking", "Internship Opportunities", "Free Lunch"],
    gradient: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
    catColor: "#818cf8",
  },
  {
    id: "demo-2",
    name: "Design Thinking Masterclass",
    description: "Learn human-centered design principles with interactive exercises and real case studies.",
    category: "Seminar",
    startDate: "10 May 2026",
    time: "2:00 PM - 5:00 PM",
    venue: "Creative Arts Building, Room 201",
    fee: 149,
    org: "UX Design Academy",
    advantages: ["Design Toolkit", "Certificate", "Portfolio Review"],
    gradient: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
    catColor: "#f59e0b",
  },
  {
    id: "demo-3",
    name: "Cloud Computing Deep Dive",
    description: "AWS, Azure, and GCP compared. Learn cloud architecture, deployment, and cost optimization.",
    category: "Webinar",
    startDate: "15 May 2026",
    time: "3:00 PM - 5:00 PM",
    venue: "Online (Google Meet)",
    fee: 0,
    org: "CloudTech Foundation",
    advantages: ["Free", "Cloud Credits", "Certificate"],
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    catColor: "#8b5cf6",
  },
  {
    id: "demo-4",
    name: "AI & Machine Learning Workshop",
    description: "Hands-on workshop covering deep learning, NLP, and computer vision with real-world projects.",
    category: "Workshop",
    startDate: "20 Apr 2026",
    time: "10:00 AM - 4:00 PM",
    venue: "Online (Zoom)",
    fee: 0,
    org: "AI Research Lab",
    advantages: ["Free", "Certificate", "Project-Based Learning"],
    gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
    catColor: "#10b981",
  },
  {
    id: "demo-5",
    name: "Startup Summit 2026",
    description: "Connect with founders, VCs, and mentors. Pitch your startup idea and win seed funding.",
    category: "Conference",
    startDate: "5 May 2026 – 6 May",
    time: "11:00 AM - 7:00 PM",
    venue: "Hyderabad Convention Centre",
    fee: 499,
    org: "Startup India Hub",
    advantages: ["Investor Access", "Mentorship", "Startup Kit"],
    gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    catColor: "#3b82f6",
  },
  {
    id: "demo-6",
    name: "CyberSec CTF Challenge",
    description: "Capture The Flag competition testing your cybersecurity skills across web, forensics, and crypto.",
    category: "Competition",
    startDate: "28 Apr 2026",
    time: "6:00 PM - 12:00 AM",
    venue: "Online",
    fee: 0,
    org: "CyberShield Club",
    advantages: ["Prizes Worth ₹50K", "Certificate", "Industry Recognition"],
    gradient: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
    catColor: "#ef4444",
  },
];

function EventCard({ event }: { event: (typeof sampleEvents)[number] }) {
  return (
    <div className="event-card">
      {/* Gradient top bar */}
      <div style={{ height: "5px", background: event.gradient }} />
      <div style={{ padding: "22px 24px" }}>
        {/* Category + Price */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
          <span
            style={{
              padding: "4px 14px",
              borderRadius: "20px",
              background: `${event.catColor}18`,
              border: `1px solid ${event.catColor}35`,
              fontSize: "0.72rem",
              fontWeight: 600,
              color: event.catColor,
              textTransform: "capitalize",
            }}
          >
            {event.category}
          </span>
          <span
            style={{
              fontSize: "0.92rem",
              color: event.fee > 0 ? "var(--foreground)" : "#10b981",
              fontWeight: 700,
            }}
          >
            {event.fee > 0 ? `₹${event.fee}` : "FREE"}
          </span>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: "1.12rem", fontWeight: 700, marginBottom: "8px", color: "white" }}>
          {event.name}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--muted-foreground)",
            marginBottom: "14px",
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}
        >
          {event.description}
        </p>

        {/* Event details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
            <CalendarDays size={13} style={{ color: event.catColor, flexShrink: 0 }} />
            <span>{event.startDate}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
            <Clock size={13} style={{ color: event.catColor, flexShrink: 0 }} />
            <span>{event.time}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
            <MapPin size={13} style={{ color: event.catColor, flexShrink: 0 }} />
            <span>{event.venue}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
            <Users size={13} style={{ color: event.catColor, flexShrink: 0 }} />
            <span>{event.org}</span>
          </div>
        </div>

        {/* Advantages */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
          {event.advantages.map((adv) => (
            <span
              key={adv}
              style={{
                padding: "3px 10px",
                borderRadius: "16px",
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.15)",
                fontSize: "0.7rem",
                color: "#10b981",
              }}
            >
              ✓ {adv}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.76rem", color: "var(--muted-foreground)" }}>Sample Event</span>
          <span
            className="btn-primary"
            style={{ padding: "8px 18px", fontSize: "0.82rem", borderRadius: "10px" }}
          >
            Register →
          </span>
        </div>
      </div>
    </div>
  );
}

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

export default function LandingPage() {
  // Duplicate events for seamless infinite scroll
  const carouselEvents = [...sampleEvents, ...sampleEvents];

  return (
    <main className="relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(109,92,255,0.16),transparent_28%),radial-gradient(circle_at_85%_14%,rgba(168,85,247,0.12),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_22%)]" />

      {/* ── Navbar ── */}
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

      {/* ── Hero Section ── */}
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-8 text-center sm:px-6 sm:pt-10 lg:px-8 lg:pb-14 lg:pt-12">
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
            Browse verified events from trusted organizers. Register, pay, and get your credentials.
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
      </section>

      {/* ── Auto-Scrolling Events Carousel ── */}
      <section className="w-full pb-14 sm:pb-18 lg:pb-22">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-6 lg:px-8" style={{ marginBottom: "36px" }}>
          <p className="text-[0.72rem] font-medium uppercase tracking-[0.3em] text-violet-100">Upcoming Events</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">Discover & Register</h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
            Browse upcoming events, register as a participant, and collect your verified credentials.
          </p>
        </div>

        <div className="events-carousel">
          <div className="events-carousel-track">
            {carouselEvents.map((event, index) => (
              <EventCard key={`${event.id}-${index}`} event={event} />
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/events"
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "rounded-full border-white/12 bg-white/[0.05] px-8")}
          >
            <Tag className="h-4 w-4" />
            View All Events
          </Link>
        </div>
      </section>

      {/* ── How It Works ── */}
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

      {/* ── Verify Certificate ── */}
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
                  suppressHydrationWarning
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
                QR Scanner
              </p>
              <div className="mt-4">
                <QrScanner />
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

      {/* ── CTA ── */}
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

      {/* ── Footer ── */}
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

import Link from "next/link";

export default function RegisterPendingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: "radial-gradient(circle at 50% 30%, rgba(245,158,11,0.1), transparent 40%), linear-gradient(180deg, #060816 0%, #070b17 42%, #091121 100%)" }}>
      <div className="w-full max-w-md text-center animate-fade-in">
        <div style={{ marginBottom: "24px" }}>
          <div className="inline-flex items-center justify-center" style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(245,158,11,0.1)", border: "2px solid rgba(245,158,11,0.3)" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-3" style={{ color: "var(--foreground)" }}>
          Application Under Review
        </h1>

        <div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
          <p style={{ color: "var(--muted-foreground)", lineHeight: 1.7 }}>
            Your organizer application is currently being reviewed by our admin team. You&apos;ll receive an email notification once your application has been approved. Until then, dashboard access is restricted.
          </p>
        </div>

        <Link href="/sign-in" className="btn-secondary" style={{ width: "100%" }}>
          Back to Sign In
        </Link>
      </div>
    </main>
  );
}

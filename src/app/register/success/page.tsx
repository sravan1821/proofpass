import Link from "next/link";

export default function RegisterSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: "radial-gradient(circle at 50% 30%, rgba(16,185,129,0.1), transparent 40%), linear-gradient(180deg, #060816 0%, #070b17 42%, #091121 100%)" }}>
      <div className="w-full max-w-md text-center animate-fade-in">
        {/* Success Icon */}
        <div style={{ marginBottom: "24px" }}>
          <div className="inline-flex items-center justify-center" style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "2px solid rgba(16,185,129,0.3)" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-3" style={{ color: "var(--foreground)" }}>
          Application Submitted!
        </h1>

        <div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
          <p style={{ color: "var(--muted-foreground)", lineHeight: 1.7, marginBottom: "16px" }}>
            Your application has been received and is under review. Our admin team will review your application and you will receive an email once it has been approved.
          </p>
          <div style={{ background: "rgba(79,70,229,0.08)", borderRadius: "10px", padding: "16px" }}>
            <p style={{ color: "var(--primary-soft)", fontSize: "0.875rem", fontWeight: 500 }}>
              Expected review time: 24–48 hours
            </p>
          </div>
        </div>

        <Link href="/sign-in" className="btn-primary" style={{ width: "100%" }}>
          Back to Sign In
        </Link>
      </div>
    </main>
  );
}

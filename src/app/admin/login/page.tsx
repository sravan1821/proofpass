"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { signInAction } from "@/app/sign-in/actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function AdminLoginContent() {
  const searchParams = useSearchParams();
  const initialError = useMemo(() => {
    const errorCode = searchParams.get("error");
    if (errorCode === "oauth_callback_failed") return "Unable to complete sign-in. Please try again.";
    if (errorCode === "service_unavailable") return "Authentication service unavailable. Please try again later.";
    if (errorCode === "profile_not_found") return "Profile not found. Please contact support.";
    if (errorCode === "application_rejected") return "Your application has been rejected. Please contact support.";
    return "";
  }, [searchParams]);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError(initialError);
  }, [initialError]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signInAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: "radial-gradient(circle at 50% 30%, rgba(220,38,38,0.1), transparent 40%), linear-gradient(180deg, #0a0606 0%, #0d0808 42%, #110a0a 100%)" }}>
      <div className="w-full max-w-md animate-fade-in">
        {/* Admin Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: "#dc2626" }}>
              A
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              Admin Console
            </h1>
          </div>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.95rem" }}>
            ProofPass Administration Portal
          </p>
        </div>

        {/* Login Card */}
        <div style={{ background: "rgba(20,12,12,0.65)", backdropFilter: "blur(16px)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: "16px", padding: "32px" }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", color: "#ef4444", fontSize: "0.875rem" }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Admin Email</label>
              <input type="email" name="email" required className="input-field" placeholder="admin@proofpass.in" autoComplete="email" />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Password</label>
              <input type="password" name="password" required className="input-field" placeholder="••••••••" autoComplete="current-password" />
            </div>

            <button type="submit" disabled={loading} style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px 24px", background: "#dc2626", color: "white", border: "none", borderRadius: "10px", fontWeight: 600, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Authenticating..." : "Access Admin Console"}
            </button>
          </form>
        </div>

        <div className="text-center" style={{ marginTop: "20px" }}>
          <Link href="/sign-in" style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
            ← Back to Organizer Login
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginContent />
    </Suspense>
  );
}

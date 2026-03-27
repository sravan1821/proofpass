"use client";

import { useState } from "react";
import { signInAction } from "./actions";
import { createSupabaseBrowserClient } from "@/lib/db/supabase/client";
import Link from "next/link";

export default function SignInPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: "radial-gradient(circle at 30% 20%, rgba(79,70,229,0.15), transparent 40%), radial-gradient(circle at 70% 80%, rgba(99,102,241,0.1), transparent 40%), linear-gradient(180deg, #060816 0%, #070b17 42%, #091121 100%)" }}>
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: "var(--primary)" }}>
              P
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              ProofPass
            </h1>
          </div>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.95rem" }}>
            Sign in to your account
          </p>
        </div>

        {/* Sign In Card */}
        <div className="glass-card" style={{ padding: "32px" }}>
          <form onSubmit={handleSubmit}>
            {/* Error Alert */}
            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", color: "var(--danger)", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                {error}
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                className="input-field"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="input-field"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer", padding: "4px" }}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me + Forgot Password */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem", color: "var(--muted-foreground)", cursor: "pointer" }}>
                <input type="checkbox" name="remember" style={{ accentColor: "var(--primary)" }} />
                Remember me
              </label>
              <Link href="/forgot-password" style={{ fontSize: "0.875rem", color: "var(--primary-soft)" }}>
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%" }}>
              {loading ? (
                <>
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "24px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={async () => {
              const supabase = createSupabaseBrowserClient();
              if (!supabase) return;
              await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: `${window.location.origin}/sign-in` },
              });
            }}
            className="btn-secondary"
            style={{ width: "100%", justifyContent: "center" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ height: "12px" }} />

          {/* Register Link */}
          <Link href="/register" className="btn-secondary" style={{ width: "100%", textAlign: "center" }}>
            Register as Event Organizer
          </Link>
        </div>

        {/* Admin Link */}
        <div className="text-center" style={{ marginTop: "24px" }}>
          <Link href="/admin/login" style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", opacity: 0.6 }}>
            Admin Access →
          </Link>
        </div>
      </div>
    </main>
  );
}

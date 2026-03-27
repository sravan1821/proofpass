"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { requestPasswordResetAction, resetPasswordAction } from "./actions";

type Step = "email" | "sent" | "reset";

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const initialStep = useMemo<Step>(() => {
    return searchParams.get("token") ? "reset" : "email";
  }, [searchParams]);
  const initialError = useMemo(() => {
    const errorCode = searchParams.get("error");
    if (errorCode === "oauth_callback_failed") return "Unable to complete password recovery. Please try again.";
    if (errorCode === "service_unavailable") return "Authentication service unavailable. Please try again later.";
    return "";
  }, [searchParams]);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    setError(initialError);
  }, [initialError]);

  async function handleSendReset() {
    setError("");
    setLoading(true);
    const formData = new FormData();
    formData.set("email", email);
    const result = await requestPasswordResetAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setResetUrl(result?.resetUrl || "");
    setStep("sent");
    setLoading(false);
  }

  async function handleResetPassword() {
    setError("");
    setLoading(true);
    const formData = new FormData();
    formData.set("token", searchParams.get("token") || "");
    formData.set("password", password);
    formData.set("confirmPassword", confirmPassword);
    const result = await resetPasswordAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    window.location.href = "/sign-in";
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: "radial-gradient(circle at 50% 30%, rgba(79,70,229,0.12), transparent 40%), linear-gradient(180deg, #060816 0%, #070b17 42%, #091121 100%)" }}>
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Reset Password</h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.95rem", marginTop: "8px" }}>
            {step === "email" && "Enter your email to receive a reset link"}
            {step === "sent" && "Check your email for the reset link"}
            {step === "reset" && "Set your new password"}
          </p>
        </div>

        <div className="glass-card" style={{ padding: "32px" }}>
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", color: "var(--danger)", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          {step === "email" && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
              </div>
              <button onClick={handleSendReset} className="btn-primary" disabled={loading || !email} style={{ width: "100%" }}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </>
          )}

          {step === "sent" && (
            <div className="text-center">
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "2px solid rgba(16,185,129,0.3)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </div>
              <p style={{ color: "var(--muted-foreground)", lineHeight: 1.7 }}>
                We&apos;ve sent a password reset link to <strong style={{ color: "var(--foreground)" }}>{email}</strong>. Please check your inbox.
              </p>
              {resetUrl ? (
                <p style={{ marginTop: "16px", color: "var(--warning)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                  Development reset link:{" "}
                  <a href={resetUrl} style={{ color: "var(--primary-soft)", textDecoration: "underline" }}>
                    {resetUrl}
                  </a>
                </p>
              ) : null}
            </div>
          )}

          {step === "reset" && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>New Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Min 8 characters" />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" placeholder="Confirm new password" />
              </div>
              <button onClick={handleResetPassword} className="btn-primary" disabled={loading} style={{ width: "100%" }}>
                {loading ? "Updating..." : "Reset Password"}
              </button>
            </>
          )}
        </div>

        <div className="text-center" style={{ marginTop: "20px" }}>
          <Link href="/sign-in" style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent />
    </Suspense>
  );
}

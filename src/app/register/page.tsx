"use client";

import { useState } from "react";
import { registerOrganizerAction } from "./actions";
import Link from "next/link";

const ORG_TYPES = [
  "University",
  "College",
  "Corporate",
  "Non-Governmental Organization",
  "Community / User Group",
  "Government Body",
  "Independent / Individual",
];

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agreed) {
      setError("You must accept the Terms and Conditions.");
      return;
    }
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerOrganizerAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 py-12" style={{ background: "radial-gradient(circle at 30% 20%, rgba(79,70,229,0.15), transparent 40%), linear-gradient(180deg, #060816 0%, #070b17 42%, #091121 100%)" }}>
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: "var(--primary)" }}>P</div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Register as Event Organizer</h1>
          </div>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.95rem" }}>
            Submit your application to start issuing verified certificates
          </p>
        </div>

        {/* Registration Card */}
        <div className="glass-card" style={{ padding: "32px" }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", color: "var(--danger)", fontSize: "0.875rem" }}>
                {error}
              </div>
            )}

            {/* Section: Personal Info */}
            <h3 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--primary-soft)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
              Contact Information
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Full Name *</label>
                <input type="text" name="fullName" required className="input-field" placeholder="John Doe" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Email Address *</label>
                <input type="email" name="email" required className="input-field" placeholder="you@organization.com" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Password *</label>
                <input type="password" name="password" required minLength={8} className="input-field" placeholder="Min 8 characters" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Phone Number *</label>
                <input type="tel" name="phone" required className="input-field" placeholder="+91 9876543210" />
              </div>
            </div>

            {/* Section: Organization */}
            <h3 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--primary-soft)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
              Organization Details
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Organization Name *</label>
                <input type="text" name="orgName" required className="input-field" placeholder="JNTU Hyderabad" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Organization Type *</label>
                <select name="orgType" required className="input-field">
                  <option value="">Select type...</option>
                  {ORG_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Organization Website</label>
                <input type="url" name="orgWebsite" className="input-field" placeholder="https://www.example.com" />
              </div>
            </div>

            {/* Section: Address */}
            <h3 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--primary-soft)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
              Location
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>City *</label>
                <input type="text" name="city" required className="input-field" placeholder="Hyderabad" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>State</label>
                <input type="text" name="state" className="input-field" placeholder="Telangana" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Country *</label>
                <input type="text" name="country" required className="input-field" placeholder="India" />
              </div>
            </div>

            {/* Purpose */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Purpose & Description *</label>
              <textarea name="purpose" required minLength={50} maxLength={500} rows={4} className="input-field" placeholder="Describe your intended use of the platform, types of events you plan to organize, and expected volume of certificates... (min 50 chars)" style={{ resize: "vertical" }} />
            </div>

            {/* Terms */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "24px", cursor: "pointer", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ accentColor: "var(--primary)", marginTop: "2px" }} />
              <span>
                I accept the <span style={{ color: "var(--primary-soft)" }}>Terms of Service</span> and <span style={{ color: "var(--primary-soft)" }}>Organizer Agreement</span>. I confirm that the information provided is accurate.
              </span>
            </label>

            {/* Submit */}
            <button type="submit" className="btn-primary" disabled={loading || !agreed} style={{ width: "100%" }}>
              {loading ? (
                <>
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                  Submitting Application...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center" style={{ marginTop: "20px" }}>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
            Already have an account?{" "}
            <Link href="/sign-in" style={{ color: "var(--primary-soft)", fontWeight: 500 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

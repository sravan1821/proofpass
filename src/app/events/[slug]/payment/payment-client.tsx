"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmPaymentAction } from "../../actions";
import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface PaymentPageClientProps {
  event: any;
  registration: any;
}

export default function PaymentPageClient({ event, registration }: PaymentPageClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
  const router = useRouter();

  const amount = Number(event.registration_fee) || 0;
  const upiId = "proofpass@ybl";
  const upiUrl = `upi://pay?pa=${upiId}&pn=ProofPass&am=${amount}&tn=${encodeURIComponent(event.name as string)}`;

  async function handleConfirmPayment() {
    setLoading(true);
    const result = await confirmPaymentAction(registration.id as string);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.registrationId) {
      router.push(`/events/${event.slug}/receipt/${result.registrationId}`);
    }
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(99,102,241,0.08)", background: "var(--glass-bg)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" className="flex items-center gap-3">
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700 }}>P</div>
            <span className="font-bold text-lg">ProofPass</span>
          </Link>
          <Link href={`/events/${event.slug}/register`} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>← Back to Registration</Link>
        </div>
      </nav>

      <div style={{ maxWidth: "600px", margin: "0 auto", paddingTop: "100px", padding: "100px 24px 60px" }}>
        <div className="glass-card" style={{ padding: "36px" }}>
          <h1 className="text-2xl font-bold" style={{ marginBottom: "8px", textAlign: "center" }}>💳 Complete Payment</h1>
          <p style={{ color: "var(--muted-foreground)", marginBottom: "28px", textAlign: "center" }}>Complete your payment for <strong>{event.name as string}</strong></p>

          {/* Payment Summary */}
          <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(79,70,229,0.05)", border: "1px solid rgba(79,70,229,0.1)", marginBottom: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Event</span>
              <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{event.name as string}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Registrant</span>
              <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{registration.full_name as string}</span>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px", marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 600 }}>Amount</span>
              <span style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--primary-soft)" }}>₹{amount}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div style={{ marginBottom: "28px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginBottom: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Choose Payment Method</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <button
                onClick={() => setPaymentMethod("upi")}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border: paymentMethod === "upi" ? "2px solid var(--primary)" : "1px solid var(--border)",
                  background: paymentMethod === "upi" ? "rgba(79,70,229,0.08)" : "transparent",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s",
                  color: "var(--foreground)",
                }}
              >
                <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>📱</div>
                <p className="font-bold" style={{ fontSize: "0.95rem", marginBottom: "2px" }}>UPI</p>
                <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Scan QR & Pay</p>
              </button>
              <button
                onClick={() => setPaymentMethod("card")}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border: paymentMethod === "card" ? "2px solid var(--primary)" : "1px solid var(--border)",
                  background: paymentMethod === "card" ? "rgba(79,70,229,0.08)" : "transparent",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s",
                  color: "var(--foreground)",
                }}
              >
                <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>💳</div>
                <p className="font-bold" style={{ fontSize: "0.95rem", marginBottom: "2px" }}>Card</p>
                <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Debit / Credit Card</p>
              </button>
            </div>
          </div>

          {/* UPI Payment */}
          {paymentMethod === "upi" && (
            <div style={{ marginBottom: "28px", textAlign: "center" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginBottom: "16px" }}>Scan this QR code to pay via UPI</p>
              <div style={{ width: "220px", height: "220px", margin: "0 auto", background: "#fff", borderRadius: "14px", padding: "14px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
                {/* QR Code generated from UPI URL */}
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=${encodeURIComponent(upiUrl)}&margin=0`}
                  alt="UPI QR Code"
                  width={192}
                  height={192}
                  style={{ borderRadius: "8px" }}
                />
              </div>
              <div style={{ marginTop: "16px" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "4px" }}>UPI ID</p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "8px", background: "rgba(79,70,229,0.06)", border: "1px solid rgba(79,70,229,0.12)" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>{upiId}</span>
                </div>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "12px" }}>
                Amount: <strong style={{ color: "var(--foreground)" }}>₹{amount}</strong>
              </p>
            </div>
          )}

          {/* Card Payment */}
          {paymentMethod === "card" && (
            <div style={{ marginBottom: "28px" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginBottom: "16px", textAlign: "center" }}>Enter your card details</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Cardholder Name</label>
                  <input type="text" className="input-field" placeholder="John Doe" style={{ fontSize: "0.9rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Card Number</label>
                  <input type="text" className="input-field" placeholder="1234 5678 9012 3456" maxLength={19} style={{ fontSize: "0.9rem", fontFamily: "var(--font-ibm-plex-mono), monospace", letterSpacing: "0.08em" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Expiry Date</label>
                    <input type="text" className="input-field" placeholder="MM / YY" maxLength={7} style={{ fontSize: "0.9rem" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", fontWeight: 500, color: "var(--muted-foreground)" }}>CVV</label>
                    <input type="password" className="input-field" placeholder="•••" maxLength={4} style={{ fontSize: "0.9rem" }} />
                  </div>
                </div>
              </div>
              <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", marginTop: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <span style={{ fontSize: "0.75rem", color: "var(--warning)" }}>Your card details are secured. This is a simulated payment.</span>
              </div>
            </div>
          )}

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px", marginBottom: "16px", color: "var(--danger)", fontSize: "0.875rem" }}>{error}</div>
          )}

          <button
            onClick={handleConfirmPayment}
            className="btn-success"
            disabled={loading}
            style={{ width: "100%", padding: "14px", fontSize: "1rem" }}
          >
            {loading ? "Confirming..." : paymentMethod === "upi" ? "✅ I Have Paid — Confirm Payment" : "✅ Pay ₹" + amount + " — Confirm Payment"}
          </button>

          <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "16px", textAlign: "center" }}>
            After clicking confirm, you will receive your registration receipt.
          </p>
        </div>
      </div>
    </div>
  );
}

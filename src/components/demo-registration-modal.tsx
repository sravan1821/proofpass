"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Smartphone,
  X,
  PartyPopper,
  CalendarDays,
  Clock,
  MapPin,
  Users,
} from "lucide-react";

interface DemoEvent {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  startDate: string;
  time: string;
  venue: string;
  fee: number;
  org: string;
  advantages: string[];
  gradient: string;
  catColor: string;
}

interface DemoRegistrationModalProps {
  event: DemoEvent;
  onClose: () => void;
}

type Step = "register" | "payment" | "success";

export default function DemoRegistrationModal({ event, onClose }: DemoRegistrationModalProps) {
  const [step, setStep] = useState<Step>("register");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
  const [confirming, setConfirming] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", phone: "", college: "" });
  const [receiptNumber] = useState(() => `PP-${Date.now().toString(36).toUpperCase().slice(0, 6)}`);

  const amount = event.fee;
  const upiId = "proofpass@ybl";
  const upiUrl = `upi://pay?pa=${upiId}&pn=ProofPass&am=${amount}&tn=${encodeURIComponent(event.name)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=${encodeURIComponent(upiUrl)}&margin=0&color=1a1a2e&bgcolor=ffffff`;

  function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;
    if (amount > 0) {
      setStep("payment");
    } else {
      setStep("success");
    }
  }

  function handleConfirmPayment() {
    setConfirming(true);
    setTimeout(() => {
      setConfirming(false);
      setStep("success");
    }, 1500);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(3, 8, 20, 0.78)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "24px",
        animation: "fadeIn 0.25s ease",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(560px, 100%)",
          maxHeight: "92vh",
          overflow: "auto",
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "linear-gradient(180deg, rgba(14,16,32,0.98), rgba(8,10,22,0.99))",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
          position: "relative",
        }}
      >
        {/* Top gradient bar */}
        <div style={{ height: "4px", background: event.gradient, borderRadius: "24px 24px 0 0" }} />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "18px",
            right: "18px",
            width: "36px",
            height: "36px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            color: "var(--foreground)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          <X size={18} />
        </button>

        <div style={{ padding: "28px 32px 32px" }}>
          {/* Step indicator */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
            {(amount > 0 ? ["Register", "Payment", "Confirmed"] : ["Register", "Confirmed"]).map((label, i) => {
              const stepIndex = step === "register" ? 0 : step === "payment" ? 1 : amount > 0 ? 2 : 1;
              const isActive = i <= stepIndex;
              return (
                <div
                  key={label}
                  style={{
                    flex: 1,
                    height: "4px",
                    borderRadius: "4px",
                    background: isActive
                      ? event.gradient
                      : "rgba(255,255,255,0.06)",
                    transition: "background 0.3s ease",
                  }}
                />
              );
            })}
          </div>

          {/* ── STEP 1: REGISTRATION ── */}
          {step === "register" && (
            <>
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span
                    style={{
                      padding: "3px 12px",
                      borderRadius: "20px",
                      background: `${event.catColor}18`,
                      border: `1px solid ${event.catColor}35`,
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: event.catColor,
                      textTransform: "capitalize",
                    }}
                  >
                    {event.category}
                  </span>
                  {amount > 0 && (
                    <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>₹{amount}</span>
                  )}
                  {amount === 0 && (
                    <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#10b981" }}>FREE</span>
                  )}
                </div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "4px" }}>
                  Register for {event.name}
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
                  <span className="inline-flex items-center gap-1"><CalendarDays size={12} /> {event.startDate}</span>
                  <span className="inline-flex items-center gap-1"><Clock size={12} /> {event.time}</span>
                  <span className="inline-flex items-center gap-1"><MapPin size={12} /> {event.venue}</span>
                  <span className="inline-flex items-center gap-1"><Users size={12} /> {event.org}</span>
                </div>
              </div>

              <form onSubmit={handleRegisterSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                      className="input-field"
                      placeholder="Enter your full name"
                      style={{ fontSize: "0.9rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      className="input-field"
                      placeholder="you@example.com"
                      style={{ fontSize: "0.9rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                      className="input-field"
                      placeholder="+91 XXXXX XXXXX"
                      style={{ fontSize: "0.9rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>
                      College / Organization
                    </label>
                    <input
                      type="text"
                      value={formData.college}
                      onChange={(e) => setFormData((p) => ({ ...p, college: e.target.value }))}
                      className="input-field"
                      placeholder="Your college or organization name"
                      style={{ fontSize: "0.9rem" }}
                    />
                  </div>
                </div>

                {amount > 0 && (
                  <div style={{
                    padding: "14px 18px",
                    borderRadius: "12px",
                    background: "rgba(245,158,11,0.06)",
                    border: "1px solid rgba(245,158,11,0.15)",
                    marginBottom: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Registration Fee</span>
                    <span style={{ fontSize: "1.15rem", fontWeight: 700 }}>₹{amount}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: "100%", padding: "14px", fontSize: "0.95rem" }}
                >
                  <span className="inline-flex items-center gap-2">
                    {amount > 0 ? "Register & Proceed to Payment" : "Register Now"}
                    <ArrowRight size={16} />
                  </span>
                </button>
              </form>
            </>
          )}

          {/* ── STEP 2: PAYMENT ── */}
          {step === "payment" && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <CreditCard size={22} /> Complete Payment
                </h2>
                <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
                  Pay for <strong>{event.name}</strong>
                </p>
              </div>

              {/* Payment summary */}
              <div style={{
                padding: "18px",
                borderRadius: "14px",
                background: "rgba(79,70,229,0.05)",
                border: "1px solid rgba(79,70,229,0.1)",
                marginBottom: "24px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>Event</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 500 }}>{event.name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>Registrant</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 500 }}>{formData.fullName}</span>
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px", marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600 }}>Total</span>
                  <span style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--primary-soft)" }}>₹{amount}</span>
                </div>
              </div>

              {/* Payment method */}
              <div style={{ marginBottom: "24px" }}>
                <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginBottom: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Choose Payment Method</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {[
                    { key: "upi" as const, icon: <Smartphone size={24} />, label: "UPI", sub: "Scan QR & Pay" },
                    { key: "card" as const, icon: <CreditCard size={24} />, label: "Card", sub: "Debit / Credit" },
                  ].map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setPaymentMethod(m.key)}
                      style={{
                        padding: "14px",
                        borderRadius: "14px",
                        border: paymentMethod === m.key ? "2px solid var(--primary)" : "1px solid rgba(255,255,255,0.08)",
                        background: paymentMethod === m.key ? "rgba(79,70,229,0.08)" : "transparent",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.2s",
                        color: "var(--foreground)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: "6px", color: "var(--primary-soft)" }}>{m.icon}</div>
                      <p style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "2px" }}>{m.label}</p>
                      <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>{m.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* UPI QR */}
              {paymentMethod === "upi" && (
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", marginBottom: "14px" }}>Scan this QR code to pay via UPI</p>
                  <div style={{
                    width: "200px",
                    height: "200px",
                    margin: "0 auto",
                    background: "#fff",
                    borderRadius: "16px",
                    padding: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrUrl}
                      alt="UPI QR Code"
                      width={176}
                      height={176}
                      style={{ borderRadius: "8px" }}
                    />
                  </div>
                  <div style={{ marginTop: "14px" }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginBottom: "4px" }}>UPI ID</p>
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 16px",
                      borderRadius: "10px",
                      background: "rgba(79,70,229,0.06)",
                      border: "1px solid rgba(79,70,229,0.12)",
                    }}>
                      <span style={{ fontWeight: 600, fontSize: "0.88rem", fontFamily: "monospace" }}>{upiId}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginTop: "10px" }}>
                    Amount: <strong style={{ color: "var(--foreground)" }}>₹{amount}</strong>
                  </p>
                </div>
              )}

              {/* Card fields */}
              {paymentMethod === "card" && (
                <div style={{ marginBottom: "24px" }}>
                  <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", marginBottom: "14px", textAlign: "center" }}>Enter your card details</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", fontSize: "0.78rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Cardholder Name</label>
                      <input type="text" className="input-field" placeholder="John Doe" style={{ fontSize: "0.88rem" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", fontSize: "0.78rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Card Number</label>
                      <input type="text" className="input-field" placeholder="1234 5678 9012 3456" maxLength={19} style={{ fontSize: "0.88rem", fontFamily: "monospace", letterSpacing: "0.08em" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "0.78rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Expiry</label>
                        <input type="text" className="input-field" placeholder="MM / YY" maxLength={7} style={{ fontSize: "0.88rem" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "0.78rem", fontWeight: 500, color: "var(--muted-foreground)" }}>CVV</label>
                        <input type="password" className="input-field" placeholder="•••" maxLength={4} style={{ fontSize: "0.88rem" }} />
                      </div>
                    </div>
                  </div>
                  <div style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "rgba(245,158,11,0.06)",
                    border: "1px solid rgba(245,158,11,0.15)",
                    marginTop: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    <span style={{ fontSize: "0.72rem", color: "var(--warning)" }}>This is a simulated payment gateway. No real charges.</span>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setStep("register")}
                  className="btn-secondary"
                  style={{ padding: "12px 20px", fontSize: "0.88rem" }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="btn-primary"
                  disabled={confirming}
                  style={{ flex: 1, padding: "14px", fontSize: "0.95rem" }}
                >
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    {confirming
                      ? "Processing..."
                      : paymentMethod === "upi"
                        ? "I Have Paid — Confirm"
                        : `Pay ₹${amount} — Confirm`}
                  </span>
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: SUCCESS ── */}
          {step === "success" && (
            <div style={{ textAlign: "center", paddingTop: "12px" }}>
              <div style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "rgba(16,185,129,0.12)",
                border: "2px solid rgba(16,185,129,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <PartyPopper size={32} style={{ color: "#10b981" }} />
              </div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "8px" }}>Registration Successful!</h2>
              <p style={{ fontSize: "0.88rem", color: "var(--muted-foreground)", marginBottom: "6px" }}>
                You have been registered for <strong style={{ color: "var(--foreground)" }}>{event.name}</strong>
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "24px" }}>
                A confirmation email has been sent to <strong style={{ color: "var(--foreground)" }}>{formData.email}</strong>
              </p>

              <div style={{
                padding: "18px",
                borderRadius: "14px",
                background: "rgba(16,185,129,0.04)",
                border: "1px solid rgba(16,185,129,0.12)",
                marginBottom: "24px",
                textAlign: "left",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Receipt No.</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, fontFamily: "monospace", color: "#10b981" }}>{receiptNumber}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Event</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>{event.name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Name</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>{formData.fullName}</span>
                </div>
                {amount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Amount Paid</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#10b981" }}>₹{amount}</span>
                  </div>
                )}
              </div>

              <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginBottom: "20px", fontStyle: "italic" }}>
                This is a demo registration. In production, organizers connect their own payment gateway.
              </p>

              <button
                type="button"
                onClick={onClose}
                className="btn-primary"
                style={{ padding: "12px 32px", fontSize: "0.92rem" }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

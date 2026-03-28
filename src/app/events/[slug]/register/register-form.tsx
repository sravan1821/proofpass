"use client";

import { useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Building2, CalendarDays, CheckCircle2, Clock3, FilePenLine, IndianRupee, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { registerForEventAction } from "../../actions";
import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface RegisterFormProps {
  event: any;
  organizer: any;
}

export default function RegisterForm({ event, organizer }: RegisterFormProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const advantages = (event.advantages as string[]) || [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("eventId", event.id as string);
    const result = await registerForEventAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.registrationId) {
      // If event has a fee, redirect to payment page
      if (event.registration_fee && Number(event.registration_fee) > 0) {
        router.push(`/events/${event.slug}/payment?rid=${result.registrationId}`);
      } else {
        // Free event — go straight to receipt
        router.push(`/events/${event.slug}/receipt/${result.registrationId}`);
      }
    }
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(99,102,241,0.08)", background: "rgba(7,11,23,0.8)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" className="flex items-center gap-3">
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700 }}>P</div>
            <span className="font-bold text-lg">ProofPass</span>
          </Link>
          <Link href="/events" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
            <ArrowLeft size={16} />
            All Events
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: "900px", margin: "0 auto", paddingTop: "100px", padding: "100px 24px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
          {/* Event Info */}
          <div>
            <div className="glass-card" style={{ padding: "28px", marginBottom: "20px" }}>
              <span className="badge badge-info" style={{ textTransform: "capitalize", marginBottom: "12px", display: "inline-flex" }}>{(event.category as string) || "event"}</span>
              <h1 className="text-2xl font-bold" style={{ marginBottom: "8px" }}>{event.name as string}</h1>
              <p style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", lineHeight: 1.7, marginBottom: "20px" }}>{event.description as string}</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                {[
                  { icon: <CalendarDays size={16} />, text: `${event.start_date ? new Date(event.start_date as string).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "TBA"}${event.end_date && event.end_date !== event.start_date ? ` – ${new Date(event.end_date as string).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}` : ""}` },
                  ...(event.event_time ? [{ icon: <Clock3 size={16} />, text: event.event_time as string }] : []),
                  { icon: <MapPin size={16} />, text: (event.venue_details as string) || (event.venue as string) || "Online" },
                  ...(organizer ? [{ icon: <Building2 size={16} />, text: (event.org_name_display as string) || (organizer.org_name as string) || (organizer.full_name as string) }] : []),
                  { icon: <IndianRupee size={16} />, text: event.registration_fee && Number(event.registration_fee) > 0 ? `₹${event.registration_fee}` : "Free" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem", color: "var(--foreground)" }}>
                    <span style={{ color: "var(--primary-soft)" }}>{item.icon}</span><span>{item.text}</span>
                  </div>
                ))}
              </div>

              {advantages.length > 0 && (
                <div>
                  <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px", fontWeight: 600 }}>Why Attend?</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {advantages.map((a, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
                        <CheckCircle2 size={16} style={{ color: "var(--success)" }} />
                        <span style={{ color: "var(--foreground)" }}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Registration Form */}
          <div>
            <div className="glass-card" style={{ padding: "28px" }}>
              <h2 className="text-lg font-bold inline-flex items-center gap-2" style={{ marginBottom: "20px" }}>
                <FilePenLine size={20} />
                Register for this Event
              </h2>

              {error && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", color: "var(--danger)", fontSize: "0.875rem" }}>{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Full Name *</label>
                  <input type="text" name="fullName" required className="input-field" placeholder="Enter your full name" />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Email Address *</label>
                  <input type="email" name="email" required className="input-field" placeholder="you@example.com" />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Phone Number</label>
                  <input type="tel" name="phone" className="input-field" placeholder="+91 XXXXX XXXXX" />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>College / Organization</label>
                  <input type="text" name="collegeName" className="input-field" placeholder="Your college or organization name" />
                </div>

                {event.registration_fee && Number(event.registration_fee) > 0 && (
                  <div style={{ padding: "14px", borderRadius: "10px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="inline-flex items-center gap-2" style={{ fontSize: "0.875rem", color: "var(--warning)" }}>
                      <AlertTriangle size={16} />
                      Registration Fee
                    </span>
                    <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--foreground)" }}>₹{event.registration_fee as number}</span>
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", padding: "14px" }}>
                  <span className="inline-flex items-center gap-2">
                    {loading ? "Registering..." : event.registration_fee && Number(event.registration_fee) > 0 ? "Register & Proceed to Payment" : "Register Now"}
                    {!loading && <ArrowRight size={16} />}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

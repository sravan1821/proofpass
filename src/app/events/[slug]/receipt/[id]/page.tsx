import { EventRecord, EventRegistrationRecord } from "@/app/events/types";
import { createSupabaseServerClient } from "@/lib/db/supabase/server";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReceiptActions } from "./receipt-actions";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: event } = await supabase!
    .from("events")
    .select("*, profiles!events_organizer_id_fkey(org_name, full_name)")
    .eq("slug", slug)
    .single();

  if (!event) notFound();

  const { data: registration } = await supabase!
    .from("event_registrations")
    .select("*")
    .eq("id", id)
    .eq("event_id", event.id)
    .single();

  if (!registration) notFound();

  const typedEvent = event as EventRecord;
  const typedRegistration = registration as EventRegistrationRecord;
  const organizer = typedEvent.profiles;
  const advantages = typedEvent.advantages || [];

  return (
    <div style={{ minHeight: "100vh" }}>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(99,102,241,0.08)", background: "rgba(7,11,23,0.8)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" className="flex items-center gap-3">
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700 }}>P</div>
            <span className="font-bold text-lg">ProofPass</span>
          </Link>
          <Link href="/events" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>Browse Events</Link>
        </div>
      </nav>

      <div style={{ maxWidth: "600px", margin: "0 auto", paddingTop: "100px", padding: "100px 24px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "2px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "2rem" }}>
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-2xl font-bold" style={{ marginBottom: "8px" }}>Registration Successful!</h1>
          <p style={{ color: "var(--muted-foreground)" }}>Your registration has been confirmed. Save this receipt for your records.</p>
        </div>

        <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ padding: "24px 28px", background: "linear-gradient(135deg, rgba(79,70,229,0.12), rgba(99,102,241,0.06))", borderBottom: "1px solid rgba(99,102,241,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="flex items-center gap-3">
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.8rem" }}>P</div>
                <span className="font-bold">ProofPass</span>
              </div>
              <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Registration Receipt</span>
            </div>
          </div>

          <div style={{ padding: "28px" }}>
            <div style={{ textAlign: "center", marginBottom: "24px", padding: "16px", borderRadius: "10px", background: "rgba(79,70,229,0.05)", border: "1px solid rgba(79,70,229,0.1)" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Receipt Number</p>
              <p style={{ fontSize: "1.2rem", fontWeight: 700, fontFamily: "var(--font-ibm-plex-mono), monospace", color: "var(--primary-soft)" }}>{typedRegistration.receipt_number || "Pending"}</p>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px", fontWeight: 600 }}>Registrant Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[
                  { label: "Name", value: typedRegistration.full_name },
                  { label: "Email", value: typedRegistration.email },
                  ...(typedRegistration.phone ? [{ label: "Phone", value: typedRegistration.phone }] : []),
                  ...(typedRegistration.college_name ? [{ label: "College/Org", value: typedRegistration.college_name }] : []),
                ].map((item) => (
                  <div key={item.label}>
                    <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginBottom: "2px" }}>{item.label}</p>
                    <p style={{ fontSize: "0.9rem", fontWeight: 500 }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: "1px dashed var(--border)", margin: "0 -28px", padding: "0 28px" }} />

            <div style={{ marginTop: "24px", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px", fontWeight: 600 }}>Event Details</h3>
              <h2 className="font-bold" style={{ fontSize: "1.2rem", marginBottom: "12px" }}>{typedEvent.name}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
                  <span style={{ minWidth: "44px", color: "var(--muted-foreground)" }}>Date</span>
                  <span>
                    {typedEvent.start_date ? new Date(typedEvent.start_date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "TBA"}
                    {typedEvent.end_date && typedEvent.end_date !== typedEvent.start_date ? ` - ${new Date(typedEvent.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}` : ""}
                  </span>
                </div>
                {typedEvent.event_time && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
                    <span style={{ minWidth: "44px", color: "var(--muted-foreground)" }}>Time</span>
                    <span>{typedEvent.event_time}</span>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
                  <span style={{ minWidth: "44px", color: "var(--muted-foreground)" }}>Venue</span>
                  <span>{typedEvent.venue_details || typedEvent.venue || "Online"}</span>
                </div>
                {organizer && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
                    <span style={{ minWidth: "44px", color: "var(--muted-foreground)" }}>Org</span>
                    <span>{typedEvent.org_name_display || organizer.org_name || organizer.full_name || "Organizer"}</span>
                  </div>
                )}
              </div>
            </div>

            {advantages.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px", fontWeight: 600 }}>What You Get</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {advantages.map((advantage, index) => (
                    <span key={index} style={{ padding: "4px 12px", borderRadius: "16px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", fontSize: "0.78rem", color: "var(--success)" }}>{advantage}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ borderTop: "1px dashed var(--border)", margin: "0 -28px", padding: "0 28px" }} />

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginBottom: "2px" }}>Payment Status</p>
                <span className={`badge ${typedRegistration.payment_status === "paid" ? "badge-success" : "badge-warning"}`}>
                  {typedRegistration.payment_status}
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginBottom: "2px" }}>Amount</p>
                <p style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--primary-soft)" }}>{typedEvent.registration_fee && Number(typedEvent.registration_fee) > 0 ? `₹${typedEvent.registration_fee}` : "Free"}</p>
              </div>
            </div>
            {typedRegistration.payment_ref && (
              <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "8px" }}>Payment Ref: {typedRegistration.payment_ref}</p>
            )}

            <div style={{ marginTop: "20px", padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                Registered on {typedRegistration.registered_at ? new Date(typedRegistration.registered_at).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" }) : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <ReceiptActions />
      </div>
    </div>
  );
}

import { createSupabaseServerClient } from "@/lib/db/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

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

  const organizer = event.profiles as any;
  const advantages = (event.advantages as string[]) || [];

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Nav */}
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
        {/* Success Banner */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "2px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "2rem" }}>
            ✅
          </div>
          <h1 className="text-2xl font-bold" style={{ marginBottom: "8px" }}>Registration Successful!</h1>
          <p style={{ color: "var(--muted-foreground)" }}>Your registration has been confirmed. Save this receipt for your records.</p>
        </div>

        {/* Receipt Card */}
        <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "24px 28px", background: "linear-gradient(135deg, rgba(79,70,229,0.12), rgba(99,102,241,0.06))", borderBottom: "1px solid rgba(99,102,241,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="flex items-center gap-3">
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.8rem" }}>P</div>
                <span className="font-bold">ProofPass</span>
              </div>
              <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Registration Receipt</span>
            </div>
          </div>

          {/* Receipt Body */}
          <div style={{ padding: "28px" }}>
            {/* Receipt Number */}
            <div style={{ textAlign: "center", marginBottom: "24px", padding: "16px", borderRadius: "10px", background: "rgba(79,70,229,0.05)", border: "1px solid rgba(79,70,229,0.1)" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Receipt Number</p>
              <p style={{ fontSize: "1.2rem", fontWeight: 700, fontFamily: "var(--font-ibm-plex-mono), monospace", color: "var(--primary-soft)" }}>{registration.receipt_number as string}</p>
            </div>

            {/* Registrant Details */}
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px", fontWeight: 600 }}>Registrant Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[
                  { label: "Name", value: registration.full_name as string },
                  { label: "Email", value: registration.email as string },
                  ...(registration.phone ? [{ label: "Phone", value: registration.phone as string }] : []),
                  ...(registration.college_name ? [{ label: "College/Org", value: registration.college_name as string }] : []),
                ].map((item) => (
                  <div key={item.label}>
                    <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginBottom: "2px" }}>{item.label}</p>
                    <p style={{ fontSize: "0.9rem", fontWeight: 500 }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px dashed var(--border)", margin: "0 -28px", padding: "0 28px" }} />

            {/* Event Details */}
            <div style={{ marginTop: "24px", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px", fontWeight: 600 }}>Event Details</h3>
              <h2 className="font-bold" style={{ fontSize: "1.2rem", marginBottom: "12px" }}>{event.name as string}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { icon: "📅", text: `${event.start_date ? new Date(event.start_date as string).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "TBA"}${event.end_date && event.end_date !== event.start_date ? ` – ${new Date(event.end_date as string).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}` : ""}` },
                  ...(event.event_time ? [{ icon: "🕐", text: event.event_time as string }] : []),
                  { icon: "📍", text: (event.venue_details as string) || (event.venue as string) || "Online" },
                  ...(organizer ? [{ icon: "🏢", text: (event.org_name_display as string) || (organizer.org_name as string) || (organizer.full_name as string) }] : []),
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
                    <span>{item.icon}</span><span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Advantages */}
            {advantages.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px", fontWeight: 600 }}>What You Get</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {advantages.map((a, i) => (
                    <span key={i} style={{ padding: "4px 12px", borderRadius: "16px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", fontSize: "0.78rem", color: "var(--success)" }}>✓ {a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div style={{ borderTop: "1px dashed var(--border)", margin: "0 -28px", padding: "0 28px" }} />

            {/* Payment Info */}
            <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginBottom: "2px" }}>Payment Status</p>
                <span className={`badge ${registration.payment_status === "paid" ? "badge-success" : "badge-warning"}`}>
                  {registration.payment_status as string}
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginBottom: "2px" }}>Amount</p>
                <p style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--primary-soft)" }}>{event.registration_fee && Number(event.registration_fee) > 0 ? `₹${event.registration_fee}` : "Free"}</p>
              </div>
            </div>
            {registration.payment_ref && (
              <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "8px" }}>Payment Ref: {registration.payment_ref as string}</p>
            )}

            {/* Registered At */}
            <div style={{ marginTop: "20px", padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                Registered on {new Date(registration.registered_at as string).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "center" }}>
          <button onClick={() => window.print()} className="btn-secondary" style={{ padding: "10px 20px", fontSize: "0.85rem" }}>
            🖨️ Print Receipt
          </button>
          <Link href="/events" className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.85rem" }}>
            Browse More Events →
          </Link>
        </div>
      </div>
    </div>
  );
}

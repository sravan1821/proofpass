import { createMongoServerClient } from "@/lib/db/mongo/server";
import Link from "next/link";
import { EventRecord } from "./types";
import ShareButton from "@/components/share-button";

export default async function PublicEventsPage() {
  let events: EventRecord[] = [];
  const regCounts: Record<string, number> = {};

  const supabase = await createMongoServerClient();
  if (supabase) {
    const { data } = await supabase
      .from("events")
      .select("*, profiles!events_organizer_id_fkey(org_name, full_name)")
      .eq("admin_approval", "approved")
      .in("status", ["published", "active", "completed"])
      .order("start_date", { ascending: true });

    if (data && data.length > 0) {
      events = data as EventRecord[];

      // Auto-mark past events as completed in background
      const todayStr = new Date().toISOString().split("T")[0];
      supabase
        .from("events")
        .update({ status: "completed" })
        .in("status", ["published", "active"])
        .lt("end_date", todayStr)
        .then(() => {});

      for (const event of events) {
        const { count } = await supabase
          .from("event_registrations")
          .select("*", { count: "exact", head: true })
          .eq("event_id", event.id);
        regCounts[event.id] = count ?? 0;
      }
    }
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const getStartDate = (event: EventRecord) => new Date(event.start_date || "");
  const getEndDate = (event: EventRecord) => new Date(event.end_date || event.start_date || "");

  const ongoing = events.filter((event) => getStartDate(event) <= now && getEndDate(event) >= todayStart);
  const upcoming = events.filter((event) => getStartDate(event) > now);
  const past = events.filter((event) => getEndDate(event) < todayStart);

  const categoryColors: Record<string, string> = {
    hackathon: "#818cf8",
    workshop: "#10b981",
    seminar: "#f59e0b",
    conference: "#3b82f6",
    competition: "#ef4444",
    webinar: "#8b5cf6",
    other: "#6b7280",
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid var(--glass-border)", background: "var(--glass-bg)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" className="flex items-center gap-3">
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1rem" }}>P</div>
            <span className="font-bold text-lg">ProofPass</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/#verify" style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", padding: "8px 16px" }}>Verify QR</Link>
            <Link href="/sign-in" className="btn-secondary" style={{ padding: "8px 20px", fontSize: "0.875rem" }}>Organizer Login</Link>
            <Link href="/register" className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.875rem" }}>Become Organizer</Link>
          </div>
        </div>
      </nav>

      <section style={{ paddingTop: "120px", paddingBottom: "40px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: "0", left: "50%", transform: "translateX(-50%)", width: "600px", height: "400px", background: "radial-gradient(ellipse, rgba(79,70,229,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "16px" }}>
            Discover & Register for <span style={{ background: "linear-gradient(135deg, #818cf8, #4f46e5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Events</span>
          </h1>
          <p style={{ fontSize: "1.1rem", color: "var(--muted-foreground)", lineHeight: 1.7, marginBottom: "8px" }}>
            Browse verified events from trusted organizers. Register as a <strong style={{ color: "var(--foreground)" }}>participant</strong>, pay via UPI or Card, and get your verified credentials.
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--primary-soft)", marginBottom: "8px" }}>
            Participants: <strong>register below</strong> | Organizers: <Link href="/sign-in" style={{ color: "var(--primary-soft)", textDecoration: "underline" }}>Sign in</Link> to create and manage events
          </p>
        </div>
      </section>

      <section style={{ maxWidth: "1100px", margin: "0 auto 28px", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{ padding: "18px 24px", borderRadius: "14px", background: "rgba(79,70,229,0.06)", border: "1px solid rgba(79,70,229,0.12)", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(79,70,229,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>P</div>
            <div>
              <p className="font-bold" style={{ fontSize: "0.9rem", marginBottom: "2px" }}>For Participants</p>
              <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>Pick an event, submit registration, complete payment if required, and collect your receipt.</p>
            </div>
          </div>
          <div style={{ padding: "18px 24px", borderRadius: "14px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>O</div>
            <div>
              <p className="font-bold" style={{ fontSize: "0.9rem", marginBottom: "2px" }}>For Event Organizers</p>
              <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}><Link href="/register" style={{ color: "var(--success)", textDecoration: "underline" }}>Register</Link>, get approved, create events, and issue certificates.</p>
            </div>
          </div>
        </div>
      </section>



      {/* Ongoing Events */}
      {ongoing.length > 0 && (
        <section style={{ maxWidth: "1100px", margin: "0 auto 48px", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
            <span style={{
              width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444",
              boxShadow: "0 0 8px rgba(239,68,68,0.5)", animation: "pulse 1.5s infinite",
            }} />
            <h2 className="font-bold" style={{ fontSize: "1.3rem", color: "#ef4444" }}>Happening Now ({ongoing.length})</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
            {ongoing.map((event) => {
              const advantages = event.advantages || [];
              const catColor = categoryColors[event.category?.toLowerCase() || "other"] || categoryColors.other;
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}/register`}
                  className="glass-card glass-card-hover"
                  style={{ padding: "0", overflow: "hidden", display: "block", cursor: "pointer", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  <div style={{ height: "4px", background: "linear-gradient(90deg, #ef4444, #f59e0b)" }} />
                  <div style={{ padding: "22px 24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ padding: "4px 12px", borderRadius: "20px", background: `${catColor}15`, border: `1px solid ${catColor}30`, fontSize: "0.72rem", fontWeight: 600, color: catColor, textTransform: "capitalize" }}>
                          {event.category || "event"}
                        </span>
                        <span style={{
                          padding: "3px 10px", borderRadius: "16px",
                          background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
                          fontSize: "0.68rem", fontWeight: 700, color: "#ef4444",
                          display: "inline-flex", alignItems: "center", gap: "5px",
                        }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite" }} />
                          LIVE
                        </span>
                      </div>
                      <span style={{ fontSize: "0.9rem", color: event.registration_fee && Number(event.registration_fee) > 0 ? "var(--foreground)" : "var(--success)", fontWeight: 700 }}>
                        {event.registration_fee && Number(event.registration_fee) > 0 ? `₹${event.registration_fee}` : "FREE"}
                      </span>
                    </div>
                    <h3 className="font-bold" style={{ fontSize: "1.15rem", marginBottom: "8px" }}>{event.name}</h3>
                    <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", marginBottom: "14px", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                      {event.description || ""}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                        <span>Date</span>
                        <span>{event.start_date ? new Date(event.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBA"}</span>
                        {event.end_date && event.end_date !== event.start_date && (
                          <span>- {new Date(event.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        )}
                      </div>
                      {event.event_time && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                          <span>Time</span><span>{event.event_time}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                        <span>Venue</span><span>{event.venue_details || event.venue || "Online"}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                        <span>Org</span><span>{event.org_name_display || event.profiles?.org_name || event.profiles?.full_name || "Organizer"}</span>
                      </div>
                    </div>
                    {advantages.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                        {advantages.slice(0, 3).map((advantage, index) => (
                          <span key={index} style={{ padding: "3px 10px", borderRadius: "16px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", fontSize: "0.7rem", color: "var(--success)" }}>{advantage}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{regCounts[event.id] || 0} registered</span>
                        <ShareButton eventName={event.name} eventDescription={event.description || undefined} eventSlug={event.slug} eventDate={event.start_date ? new Date(event.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : undefined} eventVenue={event.venue_details || event.venue || undefined} eventFee={event.registration_fee} />
                      </div>
                      <span className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.82rem" }}>
                        Register Now →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section style={{ maxWidth: "1100px", margin: "0 auto 60px", padding: "0 24px" }}>
        <h2 className="font-bold" style={{ fontSize: "1.3rem", marginBottom: "24px" }}>Upcoming Events ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <div className="glass-card" style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ color: "var(--muted-foreground)" }}>No upcoming events at the moment. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
            {upcoming.map((event) => {
              const advantages = event.advantages || [];
              const catColor = categoryColors[event.category?.toLowerCase() || "other"] || categoryColors.other;
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}/register`}
                  className="glass-card glass-card-hover"
                  style={{ padding: "0", overflow: "hidden", display: "block", cursor: "pointer" }}
                >
                  <div style={{ height: "4px", background: `linear-gradient(90deg, ${catColor}, ${catColor}88)` }} />
                  <div style={{ padding: "22px 24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <span style={{ padding: "4px 12px", borderRadius: "20px", background: `${catColor}15`, border: `1px solid ${catColor}30`, fontSize: "0.72rem", fontWeight: 600, color: catColor, textTransform: "capitalize" }}>
                        {event.category || "event"}
                      </span>
                      <span style={{ fontSize: "0.9rem", color: event.registration_fee && Number(event.registration_fee) > 0 ? "var(--foreground)" : "var(--success)", fontWeight: 700 }}>
                        {event.registration_fee && Number(event.registration_fee) > 0 ? `₹${event.registration_fee}` : "FREE"}
                      </span>
                    </div>
                    <h3 className="font-bold" style={{ fontSize: "1.15rem", marginBottom: "8px" }}>{event.name}</h3>
                    <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", marginBottom: "14px", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                      {event.description || ""}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                        <span>Date</span>
                        <span>{event.start_date ? new Date(event.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBA"}</span>
                        {event.end_date && event.end_date !== event.start_date && (
                          <span>- {new Date(event.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        )}
                      </div>
                      {event.event_time && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                          <span>Time</span><span>{event.event_time}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                        <span>Venue</span><span>{event.venue_details || event.venue || "Online"}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                        <span>Org</span><span>{event.org_name_display || event.profiles?.org_name || event.profiles?.full_name || "Organizer"}</span>
                      </div>
                    </div>

                    {advantages.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                        {advantages.slice(0, 3).map((advantage, index) => (
                          <span key={index} style={{ padding: "3px 10px", borderRadius: "16px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", fontSize: "0.7rem", color: "var(--success)" }}>{advantage}</span>
                        ))}
                        {advantages.length > 3 && (
                          <span style={{ padding: "3px 10px", fontSize: "0.7rem", color: "var(--muted-foreground)" }}>+{advantages.length - 3} more</span>
                        )}
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{regCounts[event.id] || 0} registered</span>
                        <ShareButton
                          eventName={event.name}
                          eventDescription={event.description || undefined}
                          eventSlug={event.slug}
                          eventDate={event.start_date ? new Date(event.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : undefined}
                          eventVenue={event.venue_details || event.venue || undefined}
                          eventFee={event.registration_fee}
                        />
                      </div>
                      <span className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.82rem" }}>
                        Register Now →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section style={{ maxWidth: "1100px", margin: "0 auto 60px", padding: "0 24px" }}>
          <h2 className="font-bold" style={{ fontSize: "1.3rem", marginBottom: "24px", color: "var(--muted-foreground)" }}>Past Events ({past.length})</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
            {past.map((event) => (
              <div key={event.id} className="glass-card" style={{ padding: "0", overflow: "hidden", opacity: 0.7 }}>
                <div style={{ height: "4px", background: "linear-gradient(90deg, var(--muted-foreground), transparent)" }} />
                <div style={{ padding: "22px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      <h3 className="font-bold" style={{ marginBottom: "4px" }}>{event.name}</h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
                        {event.start_date ? new Date(event.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"} • {event.category || "Event"} • {regCounts[event.id] || 0} registered
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "16px", background: "rgba(107,114,128,0.12)", border: "1px solid rgba(107,114,128,0.2)", fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af" }}>
                        Completed
                      </span>
                      <ShareButton
                        eventName={event.name}
                        eventDescription={event.description || undefined}
                        eventSlug={event.slug}
                        eventDate={event.start_date ? new Date(event.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : undefined}
                        eventVenue={event.venue_details || event.venue || undefined}
                        eventFee={event.registration_fee}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div className="flex items-center gap-2">
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.75rem" }}>P</div>
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--muted-foreground)" }}>ProofPass</span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", opacity: 0.6 }}>© {new Date().getFullYear()} ProofPass. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

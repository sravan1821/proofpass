/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireApprovedOrganizer } from "@/lib/auth";
import { createMongoServerClient } from "@/lib/db/mongo/server";
import Link from "next/link";

export default async function EventsListPage() {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();

  // Fetch all events for this organizer
  const { data: events } = (await supabase!
    .from("events")
    .select("*")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false })) as { data: any[] | null };

  // Get registration counts
  const regCounts: Record<string, number> = {};
  for (const event of (events || []) as any[]) {
    const { count } = await supabase!
      .from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", event.id);
    regCounts[event.id] = count ?? 0;
  }

  // Get winner counts per event
  const winnerCounts: Record<string, number> = {};
  for (const event of (events || []) as any[]) {
    const { count } = await supabase!
      .from("participants")
      .select("*", { count: "exact", head: true })
      .eq("event_id", event.id)
      .eq("category", "winner");
    winnerCounts[event.id] = count ?? 0;
  }

  const now = new Date();
  const activeEvents = (events || []).filter((e: any) => new Date(e.end_date || e.start_date) >= now);
  const pastEvents = (events || []).filter((e: any) => new Date(e.end_date || e.start_date) < now);

  const totalRegistrations = Object.values(regCounts).reduce((a, b) => a + b, 0);
  const totalWinners = Object.values(winnerCounts).reduce((a, b) => a + b, 0);

  const approvalBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      pending: { cls: "badge-warning", label: "Pending Approval" },
      approved: { cls: "badge-success", label: "Approved" },
      rejected: { cls: "badge-danger", label: "Rejected" },
    };
    return map[status] || { cls: "badge-neutral", label: status };
  };

  function EventCard({ event }: { event: Record<string, unknown> }) {
    const ab = approvalBadge((event.admin_approval as string) || "pending");
    const isPast = new Date((event.end_date as string) || (event.start_date as string)) < now;
    return (
      <Link href={`/dashboard/events/${event.id}`} className="glass-card glass-card-hover" style={{ padding: "0", display: "block", cursor: "pointer", overflow: "hidden" }}>
        {/* Color indicator bar */}
        <div style={{ height: "4px", background: isPast ? "linear-gradient(90deg, var(--muted-foreground), transparent)" : "linear-gradient(90deg, var(--primary), var(--primary-soft))" }} />
        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div>
              <h3 className="font-bold" style={{ fontSize: "1.1rem", marginBottom: "4px" }}>{event.name as string}</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                {event.start_date ? new Date(event.start_date as string).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "No date"}
                {event.event_time ? ` • ${event.event_time}` : ""}
                {event.category ? ` • ${event.category}` : ""}
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
              <span className={`badge ${event.status === "completed" ? "badge-success" : event.status === "draft" ? "badge-neutral" : "badge-info"}`}>{event.status as string}</span>
              <span className={`badge ${ab.cls}`}>{ab.label}</span>
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Registrations</p>
              <p style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--primary-soft)" }}>{regCounts[event.id as string] || 0}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Winners</p>
              <p style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--gold)" }}>{winnerCounts[event.id as string] || 0}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Fee</p>
              <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--success)" }}>{event.registration_fee ? `₹${event.registration_fee}` : "Free"}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Venue</p>
              <p style={{ fontSize: "0.85rem", fontWeight: 500 }}>{(event.venue_details as string) || (event.venue as string) || "—"}</p>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 className="text-2xl font-bold mb-1">Events</h1>
          <p style={{ color: "var(--muted-foreground)" }}>
            {(events || []).length} total events • {totalRegistrations} registrations • {totalWinners} winners
          </p>
        </div>
        <Link href="/dashboard/events/new" className="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add New Event
        </Link>
      </div>

      {/* Stats Summary Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "var(--border)", borderRadius: "14px", overflow: "hidden", marginBottom: "28px" }}>
        {[
          { label: "Active Events", value: activeEvents.length, color: "var(--primary-soft)" },
          { label: "Past Events", value: pastEvents.length, color: "var(--muted-foreground)" },
          { label: "Total Registered", value: totalRegistrations, color: "var(--success)" },
          { label: "Total Winners", value: totalWinners, color: "var(--gold)" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--surface)", padding: "20px", textAlign: "center" }}>
            <p style={{ fontSize: "1.6rem", fontWeight: 700, color: s.color, marginBottom: "4px" }}>{s.value}</p>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Active / Upcoming Events */}
      <div style={{ marginBottom: "32px" }}>
        <h2 className="font-bold mb-3" style={{ fontSize: "1.1rem", color: "var(--primary-soft)" }}>
          📅 Active & Upcoming ({activeEvents.length})
        </h2>
        {activeEvents.length === 0 ? (
          <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📅</div>
            <p style={{ color: "var(--muted-foreground)", marginBottom: "16px" }}>No upcoming events. Create your first event!</p>
            <Link href="/dashboard/events/new" className="btn-primary" style={{ display: "inline-flex" }}>Create Event</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {activeEvents.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="font-bold mb-3" style={{ fontSize: "1.1rem", color: "var(--muted-foreground)" }}>
            📋 Past Events ({pastEvents.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {pastEvents.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        </div>
      )}
    </div>
  );
}

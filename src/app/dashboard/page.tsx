import { requireApprovedOrganizer } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/db/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await requireApprovedOrganizer();
  const supabase = await createSupabaseServerClient();

  // Fetch stats scoped to organizer
  const { count: totalEvents } = await supabase!.from("events").select("*", { count: "exact", head: true }).eq("organizer_id", user.id);
  const { count: activeEvents } = await supabase!.from("events").select("*", { count: "exact", head: true }).eq("organizer_id", user.id).in("status", ["published", "active"]);
  const { count: totalCerts } = await supabase!.from("certificates").select("*", { count: "exact", head: true }).eq("organizer_id", user.id);
  const { count: totalForms } = await supabase!.from("forms").select("*", { count: "exact", head: true }).eq("organizer_id", user.id);

  // Recent events
  const { data: recentEvents } = await supabase!
    .from("events")
    .select("*")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    { label: "Total Events", value: totalEvents ?? 0, icon: "📅", color: "#818cf8" },
    { label: "Active Events", value: activeEvents ?? 0, icon: "⚡", color: "#10b981" },
    { label: "Certificates Issued", value: totalCerts ?? 0, icon: "🏆", color: "#f59e0b" },
    { label: "Forms Created", value: totalForms ?? 0, icon: "📝", color: "#3b82f6" },
  ];

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 className="text-2xl font-bold mb-1">Welcome back, {user.fullName.split(" ")[0]}!</h1>
        <p style={{ color: "var(--muted-foreground)" }}>{user.orgName} • Dashboard Overview</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card glass-card-hover" style={{ padding: "24px", cursor: "default" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</p>
              <span style={{ fontSize: "1.2rem" }}>{stat.icon}</span>
            </div>
            <p style={{ fontSize: "2.2rem", fontWeight: 700, color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions + Recent Events */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
        {/* Quick Actions */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h2 className="font-bold mb-4">Quick Actions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link href="/dashboard/events/new" className="btn-primary" style={{ justifyContent: "flex-start" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create New Event
            </Link>
            <Link href="/dashboard/forms/new" className="btn-secondary" style={{ justifyContent: "flex-start" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              Build New Form
            </Link>
            <Link href="/dashboard/certificates" className="btn-secondary" style={{ justifyContent: "flex-start" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
              Issue Certificates
            </Link>
          </div>
        </div>

        {/* Recent Events */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 className="font-bold">Recent Events</h2>
            <Link href="/dashboard/events" style={{ color: "var(--primary-soft)", fontSize: "0.875rem" }}>View All →</Link>
          </div>

          {(!recentEvents || recentEvents.length === 0) ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted-foreground)" }}>
              <p style={{ marginBottom: "16px" }}>No events yet. Create your first event!</p>
              <Link href="/dashboard/events/new" className="btn-primary" style={{ display: "inline-flex" }}>Create Event</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {recentEvents.map((event) => (
                <Link key={event.id} href={`/dashboard/events/${event.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", transition: "all 0.2s" }}>
                  <div>
                    <p className="font-semibold" style={{ marginBottom: "2px" }}>{event.name}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                      {event.start_date ? new Date(event.start_date).toLocaleDateString() : "No date"}
                      {event.category ? ` • ${event.category}` : ""}
                    </p>
                  </div>
                  <span className={`badge ${event.status === "completed" ? "badge-success" : event.status === "draft" ? "badge-neutral" : "badge-info"}`}>{event.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

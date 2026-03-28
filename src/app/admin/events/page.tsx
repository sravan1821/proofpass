/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireAdmin } from "@/lib/auth";
import { createMongoServerClient } from "@/lib/db/mongo/server";
import { ArrowLeft, CheckCircle2, Clock3, XCircle } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-provider";

export default async function AdminEventsPage() {
  await requireAdmin();
  const supabase = await createMongoServerClient();

  // Fetch all events with organizer info and registration count
  const { data: events } = (await supabase!
    .from("events")
    .select("*, profiles!events_organizer_id_fkey(full_name, org_name, email)")
    .order("created_at", { ascending: false })) as { data: any[] | null };

  // Get registration counts per event
  const eventIds = (events || []).map((e: any) => e.id);
  const regCounts: Record<string, number> = {};
  if (eventIds.length > 0) {
    for (const eid of eventIds) {
      const { count } = await supabase!
        .from("event_registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eid);
      regCounts[eid] = count ?? 0;
    }
  }

  const pendingEvents = (events || []).filter((e: any) => e.admin_approval === "pending");
  const approvedEvents = (events || []).filter((e: any) => e.admin_approval === "approved");
  const rejectedEvents = (events || []).filter((e: any) => e.admin_approval === "rejected");

  const approvalBadge = (status: string) => {
    const map: Record<string, string> = { pending: "badge-warning", approved: "badge-success", rejected: "badge-danger" };
    return map[status] || "badge-neutral";
  };

  function renderEventRow(event: Record<string, unknown>) {
    const organizer = event.profiles as Record<string, unknown> | null;
    return (
      <Link
        key={event.id as string}
        href={`/admin/events/${event.id}`}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", transition: "all 0.2s" }}
      >
        <div>
          <p className="font-semibold" style={{ marginBottom: "4px" }}>{event.name as string}</p>
          <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
            {organizer ? `${organizer.org_name || organizer.full_name}` : "—"} •{" "}
            {event.start_date ? new Date(event.start_date as string).toLocaleDateString() : "No date"} •{" "}
            {event.category as string || "Other"}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{regCounts[event.id as string] || 0} registrations</span>
          <span className={`badge ${approvalBadge(event.admin_approval as string)}`}>{event.admin_approval as string}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        </div>
      </Link>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", borderBottom: "1px solid rgba(220,38,38,0.12)" }}>
        <div className="flex items-center gap-3">
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700 }}>A</div>
          <span className="font-bold text-lg">Admin Console</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle size="sm" />
          <Link href="/admin" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>
            <ArrowLeft size={16} />
            Dashboard
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px" }}>
        <h1 className="text-2xl font-bold mb-2">Event Management</h1>
        <p style={{ color: "var(--muted-foreground)", marginBottom: "32px" }}>Review and approve event submissions from organizers</p>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "32px" }}>
          {[
            { label: "Pending Approval", value: pendingEvents.length, color: "#f59e0b" },
            { label: "Approved Events", value: approvedEvents.length, color: "#10b981" },
            { label: "Rejected", value: rejectedEvents.length, color: "#ef4444" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card" style={{ padding: "24px" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</p>
              <p style={{ fontSize: "2rem", fontWeight: 700, color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Pending Events */}
        {pendingEvents.length > 0 && (
          <div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
            <h2 className="text-lg font-bold inline-flex items-center gap-2" style={{ marginBottom: "16px", color: "#f59e0b" }}><Clock3 size={18} />Pending Approval</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {pendingEvents.map(renderEventRow)}
            </div>
          </div>
        )}

        {/* Approved Events */}
        <div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
          <h2 className="text-lg font-bold inline-flex items-center gap-2" style={{ marginBottom: "16px", color: "#10b981" }}><CheckCircle2 size={18} />Approved Events</h2>
          {approvedEvents.length === 0 ? (
            <p style={{ color: "var(--muted-foreground)", textAlign: "center", padding: "24px 0" }}>No approved events yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {approvedEvents.map(renderEventRow)}
            </div>
          )}
        </div>

        {/* Rejected Events */}
        {rejectedEvents.length > 0 && (
          <div className="glass-card" style={{ padding: "24px" }}>
            <h2 className="text-lg font-bold inline-flex items-center gap-2" style={{ marginBottom: "16px", color: "#ef4444" }}><XCircle size={18} />Rejected Events</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {rejectedEvents.map(renderEventRow)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

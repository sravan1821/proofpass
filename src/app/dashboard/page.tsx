/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireApprovedOrganizer } from "@/lib/auth";
import { createMongoServerClient } from "@/lib/db/mongo/server";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  History,
  Shield,
  Ticket,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();

  const { count: totalEvents } = await supabase!.from("events").select("*", { count: "exact", head: true }).eq("organizer_id", user.id);
  const { count: activeEvents } = await supabase!.from("events").select("*", { count: "exact", head: true }).eq("organizer_id", user.id).in("status", ["published", "active"]);
  const { count: totalCerts } = await supabase!.from("certificates").select("*", { count: "exact", head: true }).eq("organizer_id", user.id);
  const { count: totalRegistrations } = await supabase!.from("event_registrations").select("*", { count: "exact", head: true }).eq("organizer_id", user.id);

  const { data: recentEvents } = (await supabase!
    .from("events")
    .select("*")
    .eq("organizer_id", user.id)
    .order("start_date", { ascending: true })
    .limit(8)) as { data: any[] | null };

  // Admin-specific data
  let adminStats: { totalOrganizers: number; pendingApps: number; approvedOrgs: number; platformCerts: number } | null = null;
  let pendingApplications: any[] | null = null;

  if (user.role === "super_admin") {
    const { count: totalOrganizers } = await supabase!.from("profiles").select("*", { count: "exact", head: true }).eq("role", "organizer");
    const { count: pendingApps } = await supabase!.from("profiles").select("*", { count: "exact", head: true }).eq("role", "organizer").eq("approval_status", "submitted");
    const { count: approvedOrgs } = await supabase!.from("profiles").select("*", { count: "exact", head: true }).eq("role", "organizer").eq("approval_status", "approved");
    const { count: platformCerts } = await supabase!.from("certificates").select("*", { count: "exact", head: true });

    adminStats = {
      totalOrganizers: totalOrganizers ?? 0,
      pendingApps: pendingApps ?? 0,
      approvedOrgs: approvedOrgs ?? 0,
      platformCerts: platformCerts ?? 0,
    };

    const { data: apps } = (await supabase!
      .from("profiles")
      .select("*")
      .eq("role", "organizer")
      .in("approval_status", ["submitted", "under_review"])
      .order("created_at", { ascending: false })
      .limit(5)) as { data: any[] | null };
    pendingApplications = apps;
  }

  const statCards = [
    {
      label: "Total Events",
      value: totalEvents ?? 0,
      detail: "Conducted events and programs this term.",
      icon: <CalendarDays size={22} />,
      iconBg: "rgba(245, 158, 11, 0.12)",
      iconColor: "#f59e0b",
      valueBg: "rgba(245, 158, 11, 0.06)",
      valueColor: "#f59e0b",
      valueLabel: "TOTAL",
      cardBg: "linear-gradient(135deg, rgba(245,158,11,0.04), rgba(255,255,255,0.01))",
    },
    {
      label: "Total Registrations",
      value: totalRegistrations ?? 0,
      detail: "Participants registered across all your events.",
      icon: <Users size={22} />,
      iconBg: "rgba(88, 115, 255, 0.12)",
      iconColor: "#5873ff",
      valueBg: "rgba(88, 115, 255, 0.06)",
      valueColor: "#5873ff",
      valueLabel: "MEMBERS",
      cardBg: "linear-gradient(135deg, rgba(88,115,255,0.04), rgba(255,255,255,0.01))",
    },
    {
      label: "History",
      value: totalCerts ?? 0,
      detail: "Logged actions and credential operations.",
      icon: <History size={22} />,
      iconBg: "rgba(139, 92, 246, 0.12)",
      iconColor: "#8b5cf6",
      valueBg: "rgba(139, 92, 246, 0.06)",
      valueColor: "#8b5cf6",
      valueLabel: "TOTAL",
      cardBg: "linear-gradient(135deg, rgba(139,92,246,0.04), rgba(255,255,255,0.01))",
    },
  ];

  const statusColors: Record<string, { bg: string; color: string }> = {
    published: { bg: "rgba(16,185,129,0.12)", color: "#10b981" },
    active: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6" },
    draft: { bg: "rgba(148,163,184,0.12)", color: "#94a3b8" },
    completed: { bg: "rgba(139,92,246,0.12)", color: "#8b5cf6" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* ── Welcome Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ marginBottom: "6px" }}>
            Welcome back, {user.fullName.split(" ")[0]} 👋
          </h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.92rem" }}>
            {user.orgName ? `${user.orgName} Dashboard` : "Organizer Dashboard"} · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/dashboard/events/new" className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.88rem" }}>
            Create Event
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* ── Stat Cards (Image 3 style) ── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {statCards.map((card) => (
          <div
            key={card.label}
            className="stat-card"
            style={{ background: card.cardBg }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div
                className="stat-card-icon"
                style={{ background: card.iconBg, color: card.iconColor }}
              >
                {card.icon}
              </div>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "4px", color: "var(--foreground)" }}>
                  {card.label}
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", lineHeight: 1.5, margin: 0, maxWidth: "200px" }}>
                  {card.detail}
                </p>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="stat-card-value" style={{ color: card.valueColor }}>
                {card.value}
              </div>
              <div className="stat-card-label" style={{ color: card.valueColor, marginTop: "4px" }}>
                {card.valueLabel}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Schedule Table ── */}
      <section className="glass-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 className="font-bold" style={{ fontSize: "1.1rem", marginBottom: "4px" }}>Event Schedule</h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.84rem", margin: 0 }}>Upcoming and recent events with dates and details</p>
          </div>
          <Link href="/dashboard/events" style={{ color: "var(--primary-soft)", fontSize: "0.84rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            View all events <ArrowRight size={14} />
          </Link>
        </div>

        {recentEvents && recentEvents.length > 0 ? (
          <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <table className="schedule-table">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                  <th>Event Name</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Venue</th>
                  <th>Category</th>
                  <th>Fee</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((event: any) => {
                  const st = statusColors[event.status] || statusColors.draft;
                  return (
                    <tr key={event.id}>
                      <td>
                        <Link href={`/dashboard/events/${event.id}`} style={{ fontWeight: 600, color: "var(--foreground)" }}>
                          {event.name}
                        </Link>
                      </td>
                      <td style={{ color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <CalendarDays size={13} style={{ color: "var(--primary-soft)" }} />
                          {event.start_date ? new Date(event.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBA"}
                        </span>
                      </td>
                      <td style={{ color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <Clock size={13} style={{ color: "var(--primary-soft)" }} />
                          {event.event_time || "—"}
                        </span>
                      </td>
                      <td style={{ color: "var(--muted-foreground)", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {event.venue_details || event.venue || "Online"}
                      </td>
                      <td>
                        <span style={{ padding: "3px 10px", borderRadius: "16px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", fontSize: "0.72rem", fontWeight: 600, color: "#a78bfa", textTransform: "capitalize" }}>
                          {event.category || "event"}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: event.registration_fee && Number(event.registration_fee) > 0 ? "var(--foreground)" : "#10b981" }}>
                        {event.registration_fee && Number(event.registration_fee) > 0 ? `₹${event.registration_fee}` : "Free"}
                      </td>
                      <td>
                        <span style={{ padding: "3px 10px", borderRadius: "16px", background: st.bg, border: `1px solid ${st.color}30`, fontSize: "0.72rem", fontWeight: 600, color: st.color, textTransform: "capitalize" }}>
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "48px 18px", textAlign: "center", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px", color: "var(--primary-soft)" }}><Ticket size={40} /></div>
            <p style={{ color: "var(--muted-foreground)", marginBottom: "16px", fontSize: "0.92rem" }}>No events yet. Create your first event to see the schedule here.</p>
            <Link href="/dashboard/events/new" className="btn-primary" style={{ display: "inline-flex" }}>
              Create Event
              <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </section>

      {/* ── Quick Actions ── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {[
          { icon: <Ticket size={20} />, title: "Create Event", desc: "Set up a new event with timing, fee, and details.", href: "/dashboard/events/new", color: "#5873ff" },
          { icon: <Trophy size={20} />, title: "Issue Certificate", desc: "Issue verified certificates with QR codes.", href: "/dashboard/certificates/new", color: "#f59e0b" },
          { icon: <History size={20} />, title: "View History", desc: "Browse activity logs and past operations.", href: "/dashboard/history", color: "#8b5cf6" },
        ].map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="glass-card glass-card-hover"
            style={{ padding: "22px", display: "block" }}
          >
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: `${action.color}14`, display: "flex", alignItems: "center", justifyContent: "center", color: action.color, marginBottom: "14px" }}>
              {action.icon}
            </div>
            <h3 className="font-semibold" style={{ fontSize: "0.95rem", marginBottom: "6px" }}>{action.title}</h3>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.82rem", lineHeight: 1.6, margin: 0 }}>{action.desc}</p>
          </Link>
        ))}
      </section>

      {/* ── Admin-Specific Section ── */}
      {user.role === "super_admin" && adminStats && (
        <>
          <div style={{ borderTop: "1px solid rgba(220,38,38,0.15)", paddingTop: "24px", marginTop: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                <Shield size={16} />
              </div>
              <h2 className="font-bold" style={{ fontSize: "1.1rem" }}>Admin Overview</h2>
            </div>

            {/* Admin Stats */}
            <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
              {[
                { label: "Total Organizers", value: adminStats.totalOrganizers, color: "#818cf8" },
                { label: "Pending Applications", value: adminStats.pendingApps, color: "#f59e0b" },
                { label: "Approved Organizers", value: adminStats.approvedOrgs, color: "#10b981" },
                { label: "Platform Certificates", value: adminStats.platformCerts, color: "#3b82f6" },
              ].map((stat) => (
                <div key={stat.label} className="glass-card" style={{ padding: "20px" }}>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{stat.label}</p>
                  <p style={{ fontSize: "1.8rem", fontWeight: 800, color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </section>

            {/* Pending Applications */}
            <section className="glass-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <h3 className="font-bold" style={{ fontSize: "1rem" }}>Pending Applications</h3>
                <Link href="/admin/applications" style={{ color: "var(--primary-soft)", fontSize: "0.84rem" }}>View All →</Link>
              </div>

              {pendingApplications && pendingApplications.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {pendingApplications.map((app: any) => (
                    <Link
                      key={app.id}
                      href={`/admin/applications/${app.id}`}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.2s" }}
                    >
                      <div>
                        <p className="font-semibold" style={{ marginBottom: "3px", fontSize: "0.9rem" }}>{app.org_name || app.full_name}</p>
                        <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{app.email} · {app.org_type}</p>
                      </div>
                      <span className="badge badge-warning">{app.approval_status}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--muted-foreground)", textAlign: "center", padding: "24px 0" }}>No pending applications</p>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

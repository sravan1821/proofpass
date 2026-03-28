/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireApprovedOrganizer } from "@/lib/auth";
import { createMongoServerClient } from "@/lib/db/mongo/server";
import {
  Award,
  CalendarDays,
  Clock,
  FileText,
  History,
  Settings,
  Users,
} from "lucide-react";

// Activity type icon mapping
function getActivityIcon(type: string) {
  switch (type) {
    case "event_created": return <CalendarDays size={16} />;
    case "event_updated": return <Settings size={16} />;
    case "certificate_issued": return <Award size={16} />;
    case "form_created": return <FileText size={16} />;
    case "registration": return <Users size={16} />;
    default: return <Clock size={16} />;
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case "event_created": return "#5873ff";
    case "event_updated": return "#f59e0b";
    case "certificate_issued": return "#10b981";
    case "form_created": return "#8b5cf6";
    case "registration": return "#3b82f6";
    default: return "#94a3b8";
  }
}

// Sample history entries when no real data exists
const sampleHistory = [
  { id: "1", type: "event_created", title: "Created event 'TechFest 2026'", detail: "Hackathon · ₹299 registration fee", timestamp: "2026-03-25T10:30:00Z" },
  { id: "2", type: "form_created", title: "Built registration form", detail: "Linked to TechFest 2026 · 8 fields", timestamp: "2026-03-25T11:00:00Z" },
  { id: "3", type: "registration", title: "New registration received", detail: "Participant: Rahul Sharma · TechFest 2026", timestamp: "2026-03-26T09:15:00Z" },
  { id: "4", type: "certificate_issued", title: "Issued 12 certificates", detail: "AI Workshop · Winner, Runner-Up, Participant tiers", timestamp: "2026-03-26T14:00:00Z" },
  { id: "5", type: "event_updated", title: "Updated event details", detail: "Cloud Computing Deep Dive · Changed venue to Google Meet", timestamp: "2026-03-27T08:45:00Z" },
  { id: "6", type: "registration", title: "5 new registrations", detail: "Startup Summit 2026 · Total: 48 participants", timestamp: "2026-03-27T12:30:00Z" },
  { id: "7", type: "event_created", title: "Created event 'Design Thinking Masterclass'", detail: "Seminar · ₹149 registration fee", timestamp: "2026-03-27T16:00:00Z" },
  { id: "8", type: "certificate_issued", title: "Issued 5 certificates", detail: "CyberSec CTF · Competition winners", timestamp: "2026-03-28T09:00:00Z" },
];

export default async function HistoryPage() {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();

  // Try to fetch real events for timeline data
  const { data: recentEvents } = (await supabase!
    .from("events")
    .select("*")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)) as { data: any[] | null };

  const { count: totalCerts } = await supabase!.from("certificates").select("*", { count: "exact", head: true }).eq("organizer_id", user.id);
  const { count: totalEvents } = await supabase!.from("events").select("*", { count: "exact", head: true }).eq("organizer_id", user.id);

  // Build a real history from events if available, otherwise use samples
  let historyEntries = sampleHistory;
  let isDemo = true;

  if (recentEvents && recentEvents.length > 0) {
    isDemo = false;
    historyEntries = recentEvents.map((event: any) => ({
      id: event.id,
      type: "event_created" as string,
      title: `Created event '${event.name}'`,
      detail: `${event.category || "Event"} · ${event.registration_fee && Number(event.registration_fee) > 0 ? `₹${event.registration_fee}` : "Free"} · ${event.status}`,
      timestamp: event.created_at,
    }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6" }}>
            <History size={20} />
          </div>
          <h1 className="text-2xl font-bold">Activity History</h1>
        </div>
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.92rem", marginLeft: "52px" }}>
          Track all your recent actions, event operations, and credential activities.
        </p>
      </div>

      {/* Summary Stats */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {[
          { label: "Total Events Created", value: totalEvents ?? 0, color: "#5873ff", icon: <CalendarDays size={18} /> },
          { label: "Certificates Issued", value: totalCerts ?? 0, color: "#10b981", icon: <Award size={18} /> },
          { label: "Activity Entries", value: historyEntries.length, color: "#8b5cf6", icon: <History size={18} /> },
        ].map((stat) => (
          <div key={stat.label} className="glass-card" style={{ padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: "8px" }}>{stat.label}</p>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: stat.color }}>{stat.value}</p>
            </div>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: `${stat.color}14`, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
              {stat.icon}
            </div>
          </div>
        ))}
      </section>

      {isDemo && (
        <div style={{ padding: "12px 20px", borderRadius: "10px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--warning)" }}>
            ⚠ Showing sample activity history. Create events and issue certificates to see real activity data.
          </span>
        </div>
      )}

      {/* Timeline */}
      <section className="glass-card" style={{ padding: "28px" }}>
        <h2 className="font-bold" style={{ fontSize: "1.05rem", marginBottom: "24px" }}>Recent Activity</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {historyEntries.map((entry, index) => {
            const color = getActivityColor(entry.type);
            const isLast = index === historyEntries.length - 1;
            return (
              <div key={entry.id} style={{ display: "flex", gap: "16px", position: "relative" }}>
                {/* Timeline line */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "36px", flexShrink: 0 }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${color}14`, border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0, zIndex: 1 }}>
                    {getActivityIcon(entry.type)}
                  </div>
                  {!isLast && (
                    <div style={{ width: "2px", flex: 1, background: "rgba(255,255,255,0.06)", minHeight: "20px" }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, paddingBottom: isLast ? "0" : "20px" }}>
                  <p className="font-semibold" style={{ fontSize: "0.9rem", marginBottom: "4px" }}>{entry.title}</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "4px", lineHeight: 1.5 }}>{entry.detail}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", opacity: 0.6, display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={11} />
                    {new Date(entry.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

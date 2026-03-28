/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireApprovedOrganizer } from "@/lib/auth";
import { createMongoServerClient } from "@/lib/db/mongo/server";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  Sparkles,
  Ticket,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();

  const { count: totalEvents } = await supabase!.from("events").select("*", { count: "exact", head: true }).eq("organizer_id", user.id);
  const { count: activeEvents } = await supabase!.from("events").select("*", { count: "exact", head: true }).eq("organizer_id", user.id).in("status", ["published", "active"]);
  const { count: totalCerts } = await supabase!.from("certificates").select("*", { count: "exact", head: true }).eq("organizer_id", user.id);
  const { count: totalForms } = await supabase!.from("forms").select("*", { count: "exact", head: true }).eq("organizer_id", user.id);
  const { count: totalRegistrations } = await supabase!.from("event_registrations").select("*", { count: "exact", head: true }).eq("organizer_id", user.id);

  const { data: recentEvents } = (await supabase!
    .from("events")
    .select("*")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(4)) as { data: any[] | null };

  const { data: recentForms } = (await supabase!
    .from("forms")
    .select("*")
    .eq("organizer_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(4)) as { data: any[] | null };

  const metricCards = [
    { label: "Live Events", value: activeEvents ?? 0, detail: "Programs accepting attention right now", icon: <Zap size={18} />, color: "#10b981" },
    { label: "Registrations", value: totalRegistrations ?? 0, detail: "Audience captured across your events", icon: <Users size={18} />, color: "#8fdcff" },
    { label: "Forms", value: totalForms ?? 0, detail: "Builders and intake flows ready to ship", icon: <FileText size={18} />, color: "#5873ff" },
    { label: "Certificates", value: totalCerts ?? 0, detail: "Credentials already issued", icon: <Trophy size={18} />, color: "#f59e0b" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <section className="glass-card" style={{ padding: "30px", display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "22px" }}>
        <div>
          <span className="badge badge-info" style={{ marginBottom: "14px" }}>Organizer workspace</span>
          <h1 className="text-3xl font-bold" style={{ marginBottom: "10px", lineHeight: 1.02 }}>
            Run events, registration flows, and credential operations from one calm control room.
          </h1>
          <p style={{ color: "var(--muted-foreground)", maxWidth: "720px", lineHeight: 1.7, marginBottom: "22px" }}>
            {user.orgName} now has the base workflow in place: create events, launch Google-Forms-style intake, collect responses, and issue trusted certificates without bouncing between disconnected tools.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <Link href="/dashboard/events/new" className="btn-primary">
              Create Event
              <ArrowRight size={16} />
            </Link>
            <Link href="/dashboard/forms/new" className="btn-secondary">
              Build Form
            </Link>
          </div>
        </div>

        <div style={{ display: "grid", gap: "12px" }}>
          {[
            { icon: <CalendarDays size={16} />, title: `${totalEvents ?? 0} total events`, body: "Set up public-facing event pages, schedule details, and ticketing context." },
            { icon: <FileText size={16} />, title: `${totalForms ?? 0} form flows`, body: "Attach forms to events, start from templates, and open directly in the builder." },
            { icon: <CheckCircle2 size={16} />, title: `${totalCerts ?? 0} issued credentials`, body: "Keep the post-event trust layer connected to the same organizer workspace." },
          ].map((item) => (
            <div key={item.title} style={{ padding: "14px 16px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="inline-flex items-center gap-2" style={{ marginBottom: "6px", color: "var(--primary-soft)" }}>
                {item.icon}
                <span className="font-semibold">{item.title}</span>
              </div>
              <p style={{ color: "var(--muted-foreground)", lineHeight: 1.6, margin: 0, fontSize: "0.88rem" }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {metricCards.map((card) => (
          <div key={card.label} className="glass-card glass-card-hover" style={{ padding: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{card.label}</span>
              <span style={{ color: card.color }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: "2.1rem", fontWeight: 700, color: card.color, marginBottom: "6px" }}>{card.value}</div>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.84rem", lineHeight: 1.6, margin: 0 }}>{card.detail}</p>
          </div>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "20px" }}>
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <h2 className="font-bold" style={{ fontSize: "1.05rem" }}>Recent Event Pipelines</h2>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.84rem", marginTop: "4px" }}>Your latest event workspaces and where they stand.</p>
            </div>
            <Link href="/dashboard/events" style={{ color: "var(--primary-soft)", fontSize: "0.84rem" }}>View all</Link>
          </div>

          {recentEvents && recentEvents.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentEvents.map((event) => (
                <Link key={event.id} href={`/dashboard/events/${event.id}`} style={{ padding: "16px", borderRadius: "18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                  <div>
                    <div className="font-semibold" style={{ marginBottom: "4px" }}>{event.name}</div>
                    <div style={{ color: "var(--muted-foreground)", fontSize: "0.84rem" }}>
                      {event.start_date ? new Date(event.start_date).toLocaleDateString() : "No date"}
                      {event.category ? ` · ${event.category}` : ""}
                      {event.registration_fee ? ` · ₹${event.registration_fee}` : " · Free"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <span className={`badge ${event.status === "completed" ? "badge-success" : event.status === "draft" ? "badge-neutral" : "badge-info"}`}>{event.status}</span>
                    <span className="badge badge-neutral">{event.event_mode || "in_person"}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ padding: "40px 18px", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px", color: "var(--primary-soft)" }}><Ticket size={36} /></div>
              <p style={{ color: "var(--muted-foreground)", marginBottom: "16px" }}>No events yet. Start by creating the first experience your audience can register for.</p>
              <Link href="/dashboard/events/new" className="btn-primary" style={{ display: "inline-flex" }}>Create Event</Link>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="glass-card" style={{ padding: "24px" }}>
            <div className="inline-flex items-center gap-2" style={{ marginBottom: "14px", color: "var(--primary-soft)" }}>
              <Sparkles size={18} />
              <span className="font-semibold">Build Flow</span>
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              {[
                "Create an event workspace with timing, fee, and audience highlights.",
                "Generate a linked form from a registration, check-in, or feedback template.",
                "Use responses and participant data to drive certificates and verification.",
              ].map((step, index) => (
                <div key={step} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "999px", background: "rgba(88,115,255,0.14)", border: "1px solid rgba(88,115,255,0.28)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.76rem", color: "var(--primary-soft)", flexShrink: 0 }}>
                    {index + 1}
                  </div>
                  <p style={{ margin: 0, color: "var(--muted-foreground)", lineHeight: 1.6 }}>{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h2 className="font-bold" style={{ fontSize: "1rem" }}>Recent Forms</h2>
              <Link href="/dashboard/forms" style={{ color: "var(--primary-soft)", fontSize: "0.84rem" }}>Manage</Link>
            </div>

            {recentForms && recentForms.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {recentForms.map((form) => (
                  <Link key={form.id} href={`/dashboard/forms/${form.id}/edit`} style={{ padding: "14px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="font-semibold" style={{ marginBottom: "4px" }}>{form.title}</div>
                    <div style={{ color: "var(--muted-foreground)", fontSize: "0.82rem" }}>
                      {form.response_count || 0} responses · {form.status}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--muted-foreground)", margin: 0, lineHeight: 1.6 }}>
                No forms yet. Start with a registration template and open the builder with the core fields already added.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

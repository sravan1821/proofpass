import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/db/supabase/server";
import Link from "next/link";
import { signOutAction } from "../sign-in/actions";

export default async function AdminDashboard() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  // Fetch stats
  const { count: totalOrganizers } = await supabase!.from("profiles").select("*", { count: "exact", head: true }).eq("role", "organizer");
  const { count: pendingApps } = await supabase!.from("profiles").select("*", { count: "exact", head: true }).eq("role", "organizer").eq("approval_status", "submitted");
  const { count: approvedOrgs } = await supabase!.from("profiles").select("*", { count: "exact", head: true }).eq("role", "organizer").eq("approval_status", "approved");
  const { count: totalCerts } = await supabase!.from("certificates").select("*", { count: "exact", head: true });

  // Recent pending applications
  const { data: pendingApplications } = await supabase!
    .from("profiles")
    .select("*")
    .eq("role", "organizer")
    .in("approval_status", ["submitted", "under_review"])
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 30% 10%, rgba(220,38,38,0.08), transparent 40%), linear-gradient(180deg, #0a0606 0%, #0d0808 42%, #110a0a 100%)" }}>
      {/* Top Bar */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", borderBottom: "1px solid rgba(220,38,38,0.12)" }}>
        <div className="flex items-center gap-3">
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700 }}>A</div>
          <span className="font-bold text-lg">Admin Console</span>
        </div>
        <form action={signOutAction}>
          <button type="submit" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>Sign Out</button>
        </form>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px" }}>
        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
          {[
            { label: "Total Organizers", value: totalOrganizers ?? 0, color: "#818cf8" },
            { label: "Pending Applications", value: pendingApps ?? 0, color: "#f59e0b" },
            { label: "Approved Organizers", value: approvedOrgs ?? 0, color: "#10b981" },
            { label: "Total Certificates", value: totalCerts ?? 0, color: "#3b82f6" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card" style={{ padding: "24px" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</p>
              <p style={{ fontSize: "2rem", fontWeight: 700, color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Pending Applications */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 className="text-lg font-bold">Pending Applications</h2>
            <Link href="/admin/applications" style={{ color: "var(--primary-soft)", fontSize: "0.875rem" }}>View All →</Link>
          </div>

          {(!pendingApplications || pendingApplications.length === 0) ? (
            <p style={{ color: "var(--muted-foreground)", textAlign: "center", padding: "32px 0" }}>No pending applications</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {pendingApplications.map((app) => (
                <Link key={app.id} href={`/admin/applications/${app.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", transition: "all 0.2s" }}>
                  <div>
                    <p className="font-semibold" style={{ marginBottom: "4px" }}>{app.org_name || app.full_name}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{app.email} • {app.org_type}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="badge badge-warning">{app.approval_status}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { requireApprovedOrganizer } from "@/lib/auth";
import { createMongoServerClient } from "@/lib/db/mongo/server";

export default async function SettingsPage() {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();

  const { data: profile } = await supabase!
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div style={{ maxWidth: "700px" }}>
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p style={{ color: "var(--muted-foreground)", marginBottom: "32px" }}>Manage your organization profile and account</p>

      {/* Organization Profile */}
      <div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
        <h2 className="font-bold mb-4">Organization Profile</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Organization Name</p>
            <p className="font-semibold">{profile?.org_name || "—"}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Type</p>
            <p>{profile?.org_type || "—"}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Website</p>
            <p>{profile?.org_website || "—"}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Location</p>
            <p>{[profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ") || "—"}</p>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
        <h2 className="font-bold mb-4">Account</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Name</p>
            <p className="font-semibold">{profile?.full_name}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Email</p>
            <p>{profile?.email}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Phone</p>
            <p>{profile?.phone || "—"}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Status</p>
            <span className="badge badge-success">{profile?.approval_status}</span>
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <h2 className="font-bold mb-4">Branding</h2>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Primary Color</p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: profile?.primary_color || "#4f46e5" }} />
              <code style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>{profile?.primary_color || "#4f46e5"}</code>
            </div>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Secondary Color</p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: profile?.secondary_color || "#818cf8" }} />
              <code style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>{profile?.secondary_color || "#818cf8"}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

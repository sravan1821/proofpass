/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireApprovedOrganizer } from "@/lib/auth";
import { createMongoServerClient } from "@/lib/db/mongo/server";
import Link from "next/link";

export default async function FormsListPage() {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();

  const { data: forms } = (await supabase!
    .from("forms")
    .select("*")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false })) as { data: any[] | null };

  const statusBadge: Record<string, string> = {
    draft: "badge-neutral",
    published: "badge-success",
    closed: "badge-warning",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 className="text-2xl font-bold">Forms</h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>Create and manage registration forms</p>
        </div>
        <Link href="/dashboard/forms/new" className="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Form
        </Link>
      </div>

      {(!forms || forms.length === 0) ? (
        <div className="glass-card" style={{ padding: "60px", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📝</div>
          <h3 className="text-lg font-bold mb-2">No forms yet</h3>
          <p style={{ color: "var(--muted-foreground)", marginBottom: "24px" }}>Create a form to start collecting registrations for your events.</p>
          <Link href="/dashboard/forms/new" className="btn-primary" style={{ display: "inline-flex" }}>Create Your First Form</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
          {forms.map((form: any) => (
            <div key={form.id} className="glass-card glass-card-hover" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <h3 className="font-bold" style={{ fontSize: "1.05rem" }}>{form.title}</h3>
                <span className={`badge ${statusBadge[form.status] || "badge-neutral"}`}>{form.status}</span>
              </div>
              {form.description && <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginBottom: "12px" }}>{form.description}</p>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                  {form.response_count} responses • {((form.fields_json as unknown[]) || []).length} fields
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Link href={`/dashboard/forms/${form.id}/edit`} style={{ color: "var(--primary-soft)", fontSize: "0.85rem" }}>Edit</Link>
                  <Link href={`/dashboard/forms/${form.id}/responses`} style={{ color: "var(--primary-soft)", fontSize: "0.85rem" }}>Responses</Link>
                </div>
              </div>
              {form.status === "published" && (
                <div style={{ marginTop: "12px", padding: "10px 12px", background: "rgba(16,185,129,0.06)", borderRadius: "8px", fontSize: "0.8rem", color: "var(--success)" }}>
                  Share: {typeof window !== "undefined" ? window.location.origin : ""}/forms/{form.share_id}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

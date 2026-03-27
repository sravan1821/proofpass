import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/db/supabase/server";
import Link from "next/link";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "submitted", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "suspended", label: "Suspended" },
  { key: "revoked", label: "Revoked" },
];

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const params = await searchParams;
  const activeTab = params.status || "all";
  const searchQuery = params.q || "";

  let query = supabase!
    .from("profiles")
    .select("*")
    .eq("role", "organizer")
    .order("created_at", { ascending: false });

  if (activeTab !== "all") {
    if (activeTab === "submitted") {
      query = query.in("approval_status", ["submitted", "under_review"]);
    } else {
      query = query.eq("approval_status", activeTab);
    }
  }

  const { data: applications } = await query;

  // Client-side search filter (since Supabase text search on multiple cols is limited)
  const filtered = searchQuery
    ? applications?.filter(
        (app) =>
          (app.org_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (app.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (app.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : applications;

  const statusColors: Record<string, string> = {
    submitted: "badge-warning",
    under_review: "badge-info",
    pending_info: "badge-info",
    approved: "badge-success",
    rejected: "badge-danger",
    suspended: "badge-danger",
    revoked: "badge-danger",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 30% 10%, rgba(220,38,38,0.08), transparent 40%), linear-gradient(180deg, #0a0606 0%, #0d0808 42%, #110a0a 100%)",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 32px",
          borderBottom: "1px solid rgba(220,38,38,0.12)",
        }}
      >
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-3">
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
              }}
            >
              A
            </div>
            <span className="font-bold text-lg">Admin Console</span>
          </Link>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted-foreground)"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
          <span style={{ color: "var(--muted-foreground)" }}>Applications</span>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px" }}>
        <h1 className="text-2xl font-bold mb-6">Organizer Applications</h1>

        {/* Search + Filters */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {/* Status Tabs */}
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {STATUS_TABS.map((tab) => (
              <Link
                key={tab.key}
                href={`/admin/applications?status=${tab.key}${searchQuery ? `&q=${searchQuery}` : ""}`}
                style={{
                  padding: "6px 16px",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  background:
                    activeTab === tab.key
                      ? "rgba(220,38,38,0.15)"
                      : "transparent",
                  color:
                    activeTab === tab.key
                      ? "#f87171"
                      : "var(--muted-foreground)",
                  border:
                    activeTab === tab.key
                      ? "1px solid rgba(220,38,38,0.3)"
                      : "1px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Search */}
          <form
            style={{ display: "flex", gap: "8px" }}
          >
            <input type="hidden" name="status" value={activeTab} />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search org name, email..."
              className="input-field"
              style={{
                padding: "8px 14px",
                fontSize: "0.85rem",
                width: "260px",
              }}
            />
            <button
              type="submit"
              className="btn-secondary"
              style={{ padding: "8px 16px", fontSize: "0.85rem" }}
            >
              Search
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {[
                  "Organization",
                  "Contact",
                  "Type",
                  "City",
                  "Status",
                  "Date",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "14px 16px",
                      textAlign: "left",
                      fontSize: "0.75rem",
                      color: "var(--muted-foreground)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(!filtered || filtered.length === 0) ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    No applications found.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr
                    key={app.id}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                    }}
                  >
                    <td style={{ padding: "14px 16px", fontWeight: 500 }}>
                      {app.org_name || "—"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div>{app.full_name}</div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {app.email}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: "0.875rem",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {app.org_type || "—"}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: "0.875rem",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {app.city || "—"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        className={`badge ${statusColors[app.approval_status] || "badge-neutral"}`}
                      >
                        {app.approval_status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: "0.8rem",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Link
                        href={`/admin/applications/${app.id}`}
                        style={{
                          color: "var(--primary-soft)",
                          fontSize: "0.875rem",
                        }}
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

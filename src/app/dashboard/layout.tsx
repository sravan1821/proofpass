import { requireApprovedOrganizer } from "@/lib/auth";
import { signOutAction } from "../sign-in/actions";
import Link from "next/link";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: "grid" },
  { label: "Events", href: "/dashboard/events", icon: "calendar" },
  { label: "Forms", href: "/dashboard/forms", icon: "file-text" },
  { label: "Certificates", href: "/dashboard/certificates", icon: "award" },
  { label: "Settings", href: "/dashboard/settings", icon: "settings" },
];

function NavIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    grid: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    "file-text": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    award: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
    settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  };
  return <>{icons[name] || null}</>;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireApprovedOrganizer();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{ width: "260px", borderRight: "1px solid var(--border)", background: "rgba(10,16,32,0.8)", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40 }}>
        {/* Brand */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <Link href="/dashboard" className="flex items-center gap-3">
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1rem" }}>P</div>
            <span className="font-bold text-lg">ProofPass</span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", color: "var(--muted-foreground)", fontSize: "0.9rem", transition: "all 0.15s" }}
              className="hover:bg-[rgba(79,70,229,0.08)]"
            >
              <NavIcon name={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: "16px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 600, fontSize: "0.8rem" }}>
              {user.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.fullName}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.orgName}</p>
            </div>
          </div>
          <form action={signOutAction}>
            <button type="submit" className="btn-secondary" style={{ width: "100%", padding: "8px", fontSize: "0.8rem" }}>
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: "260px", padding: "32px" }}>
        {children}
      </main>
    </div>
  );
}

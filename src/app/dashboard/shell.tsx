"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Award, CalendarDays, LayoutGrid, Settings, FileText } from "lucide-react";
import { signOutAction } from "../sign-in/actions";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  { label: "Events", href: "/dashboard/events", icon: CalendarDays },
  { label: "Forms", href: "/dashboard/forms", icon: FileText },
  { label: "Certificates", href: "/dashboard/certificates", icon: Award },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardShell({
  user,
  children,
}: {
  user: { fullName: string; orgName: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 74 : 248;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        className="dashboard-sidebar"
        style={{
          width: `${sidebarWidth}px`,
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 40,
          transition: "width 0.24s ease",
        }}
      >
        <div style={{ padding: collapsed ? "16px 12px" : "16px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <button
              type="button"
              onClick={() => {
                if (collapsed) setCollapsed(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: collapsed ? "0" : "10px",
                background: "transparent",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                padding: collapsed ? "4px 0" : 0,
                width: collapsed ? "100%" : "auto",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
            >
              <div className="dashboard-logo-mark">P</div>
              {!collapsed ? <span className="font-bold" style={{ fontSize: "1.5rem", letterSpacing: "-0.04em" }}>ProofPass</span> : null}
            </button>

            {!collapsed ? (
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="dashboard-sidebar-toggle"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            ) : null}
          </div>
        </div>

        <nav style={{ flex: 1, padding: collapsed ? "14px 8px" : "14px 10px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`dashboard-nav-item${isActive ? " dashboard-nav-item-active" : ""}`}
                style={{
                  justifyContent: collapsed ? "center" : "flex-start",
                  padding: collapsed ? "11px 0" : "11px 12px",
                }}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} />
                {!collapsed ? <span style={{ fontSize: "0.96rem", fontWeight: 500 }}>{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: collapsed ? "12px 8px" : "14px 12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="dashboard-account-panel" style={{ justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "10px 0" : "12px" }}>
            <div className="dashboard-user-avatar">
              {user.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2)}
            </div>
            {!collapsed ? (
              <div style={{ overflow: "hidden" }}>
                <p style={{ fontSize: "0.85rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>{user.fullName}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>{user.orgName}</p>
              </div>
            ) : null}
          </div>
          {!collapsed ? (
            <form action={signOutAction} style={{ marginTop: "10px" }}>
              <button type="submit" className="dashboard-signout-button" style={{ width: "100%" }}>
                Sign Out
              </button>
            </form>
          ) : null}
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: `${sidebarWidth}px`, padding: "32px", transition: "margin-left 0.24s ease" }}>
        {children}
      </main>
    </div>
  );
}

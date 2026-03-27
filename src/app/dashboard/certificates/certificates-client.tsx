"use client";

import { useState } from "react";
import { issueCertificatesAction } from "./actions";

interface CertificatesClientProps {
  events: Array<Record<string, unknown>>;
  certificates: Array<Record<string, unknown>>;
}

export function CertificatesClient({ events, certificates }: CertificatesClientProps) {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleIssue() {
    if (!selectedEventId) return;
    setLoading(true);
    setMsg("");
    const result = await issueCertificatesAction(selectedEventId);
    if (result?.error) setMsg(result.error);
    else setMsg(`Successfully issued ${result.count} certificate(s)!`);
    setLoading(false);
  }

  const categoryColors: Record<string, string> = {
    winner: "badge-gold",
    runner_up: "badge-silver",
    participant: "badge-info",
  };

  const statusColors: Record<string, string> = {
    active: "badge-success",
    revoked: "badge-danger",
    draft: "badge-neutral",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Certificates</h1>
      <p style={{ color: "var(--muted-foreground)", marginBottom: "24px" }}>Issue and manage certificates for your events</p>

      {/* Issue Panel */}
      <div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
        <h2 className="font-bold mb-4">Issue Certificates</h2>
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Select Event</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="input-field"
            >
              <option value="">Choose an event...</option>
              {events.map((event) => (
                <option key={event.id as string} value={event.id as string}>
                  {event.name as string} ({event.status as string})
                </option>
              ))}
            </select>
          </div>
          <button onClick={handleIssue} className="btn-primary" disabled={!selectedEventId || loading}>
            {loading ? "Issuing..." : "🏆 Issue Certificates"}
          </button>
        </div>
        {msg && (
          <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", fontSize: "0.875rem", background: msg.includes("error") || msg.includes("Error") || msg.includes("No ") || msg.includes("not found") ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", color: msg.includes("error") || msg.includes("Error") || msg.includes("No ") || msg.includes("not found") ? "var(--danger)" : "var(--success)" }}>
            {msg}
          </div>
        )}
      </div>

      {/* Certificate List */}
      <div className="glass-card" style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Certificate ID", "Recipient", "Category", "Event", "Status", "Issued"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {certificates.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--muted-foreground)" }}>
                  No certificates issued yet. Select an event above to issue certificates.
                </td>
              </tr>
            ) : (
              certificates.map((cert) => (
                <tr key={cert.id as string} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <code style={{ fontSize: "0.85rem", color: "var(--primary-soft)" }}>{cert.certificate_id_display as string}</code>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{cert.recipient_name as string}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className={`badge ${categoryColors[cert.category as string] || "badge-info"}`}>
                      {(cert.category as string)?.replace("_", " ")}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>{(cert as Record<string, unknown>).event_name as string || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className={`badge ${statusColors[cert.status as string] || "badge-neutral"}`}>{cert.status as string}</span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                    {cert.issued_at ? new Date(cert.issued_at as string).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { approveEventAction, rejectEventAction } from "../../actions";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-provider";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface AdminEventDetailProps {
  event: any;
  organizer: any;
  registrations: any[];
}

export default function AdminEventDetail({ event, organizer, registrations }: AdminEventDetailProps) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");

  async function handleApprove() {
    setLoading(true);
    const result = await approveEventAction(event.id as string, approveNotes || undefined);
    if (result?.error) setMsg(result.error);
    else setMsg("Event approved successfully!");
    setLoading(false);
  }

  async function handleReject() {
    if (!rejectReason.trim()) { setMsg("Please provide a rejection reason."); return; }
    setLoading(true);
    const result = await rejectEventAction(event.id as string, rejectReason);
    if (result?.error) setMsg(result.error);
    else { setMsg("Event rejected."); setShowReject(false); }
    setLoading(false);
  }

  const advantages: string[] = event.advantages || [];

  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", borderBottom: "1px solid rgba(220,38,38,0.12)" }}>
        <div className="flex items-center gap-3">
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700 }}>A</div>
          <span className="font-bold text-lg">Admin Console</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle size="sm" />
          <Link href="/admin/events" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>
            <ArrowLeft size={16} />
            All Events
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px" }}>
        {msg && (
          <div style={{ background: msg.includes("success") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${msg.includes("success") ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: "10px", padding: "12px", marginBottom: "16px", color: msg.includes("success") ? "var(--success)" : "var(--danger)", fontSize: "0.875rem" }}>
            {msg}
          </div>
        )}

        {/* Event Info */}
        <div className="glass-card" style={{ padding: "28px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div>
              <h1 className="text-2xl font-bold mb-1">{event.name as string}</h1>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>{event.description as string || "No description provided"}</p>
            </div>
            <span className={`badge ${event.admin_approval === "approved" ? "badge-success" : event.admin_approval === "rejected" ? "badge-danger" : "badge-warning"}`}>
              {event.admin_approval as string}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" }}>
            {[
              { label: "Start Date", value: event.start_date ? new Date(event.start_date as string).toLocaleDateString() : "—" },
              { label: "End Date", value: event.end_date ? new Date(event.end_date as string).toLocaleDateString() : "—" },
              { label: "Time", value: (event.event_time as string) || "—" },
              { label: "Mode", value: ((event.event_mode as string) || "in_person").replace("_", " ") },
              { label: "Category", value: (event.category as string) || "—" },
              { label: "Venue", value: (event.venue_details as string) || (event.venue as string) || "—" },
              { label: "Fee", value: event.registration_fee ? `₹${event.registration_fee}` : "Free" },
              { label: "Registrations", value: String(registrations.length) },
            ].map((item) => (
              <div key={item.label}>
                <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                <p style={{ fontWeight: 500, marginTop: "4px", textTransform: "capitalize" }}>{item.value}</p>
              </div>
            ))}
          </div>

          {advantages.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Advantages</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {advantages.map((a, i) => (
                  <span key={i} style={{ padding: "4px 12px", borderRadius: "20px", background: "rgba(79,70,229,0.1)", border: "1px solid rgba(79,70,229,0.2)", fontSize: "0.8rem", color: "var(--primary-soft)" }}>{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Organizer Info */}
        {organizer && (
          <div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
            <h2 className="font-bold mb-3">Organizer Information</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {[
                { label: "Name", value: organizer.full_name || "—" },
                { label: "Organization", value: organizer.org_name || "—" },
                { label: "Email", value: organizer.email || "—" },
              ].map((item: { label: string; value: string }) => (
                <div key={item.label}>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                  <p style={{ fontWeight: 500, marginTop: "4px" }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approval Actions */}
        {event.admin_approval === "pending" && (
          <div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
            <h2 className="font-bold mb-4">Review Actions</h2>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Approval Notes (optional)</label>
              <input type="text" className="input-field" value={approveNotes} onChange={(e) => setApproveNotes(e.target.value)} placeholder="Add any specifications or notes..." />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleApprove} className="btn-success" disabled={loading} style={{ padding: "10px 24px", fontSize: "0.875rem" }}>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Approve Event
                </span>
              </button>
              <button onClick={() => setShowReject(true)} className="btn-danger" disabled={loading} style={{ padding: "10px 24px", fontSize: "0.875rem" }}>
                <span className="inline-flex items-center gap-2">
                  <XCircle size={16} />
                  Reject Event
                </span>
              </button>
            </div>
            {showReject && (
              <div style={{ marginTop: "16px", padding: "16px", borderRadius: "10px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--danger)" }}>Rejection Reason *</label>
                <textarea className="input-field" rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Provide a reason for rejection..." style={{ resize: "vertical" }} />
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <button onClick={handleReject} className="btn-danger" disabled={loading} style={{ padding: "8px 16px", fontSize: "0.85rem" }}>Confirm Reject</button>
                  <button onClick={() => setShowReject(false)} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Admin Notes (if already decided) */}
        {event.admin_event_notes && event.admin_approval !== "pending" && (
          <div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
            <h2 className="font-bold mb-2">Admin Notes</h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>{event.admin_event_notes as string}</p>
          </div>
        )}

        {/* Registrations Table */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h2 className="font-bold mb-4">Registrations ({registrations.length})</h2>
          {registrations.length === 0 ? (
            <p style={{ color: "var(--muted-foreground)", textAlign: "center", padding: "24px 0" }}>No registrations yet</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Name", "Email", "Phone", "College", "Payment", "Date"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {registrations.map((r) => (
                  <tr key={r.id as string} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "12px", fontWeight: 500 }}>{r.full_name as string}</td>
                    <td style={{ padding: "12px", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>{r.email as string}</td>
                    <td style={{ padding: "12px", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>{(r.phone as string) || "—"}</td>
                    <td style={{ padding: "12px", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>{(r.college_name as string) || "—"}</td>
                    <td style={{ padding: "12px" }}>
                      <span className={`badge ${r.payment_status === "paid" ? "badge-success" : "badge-warning"}`}>{r.payment_status as string}</span>
                    </td>
                    <td style={{ padding: "12px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{new Date(r.registered_at as string).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

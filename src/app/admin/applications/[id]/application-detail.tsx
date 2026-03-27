"use client";

import { useState } from "react";
import { approveApplicationAction, rejectApplicationAction } from "../../actions";

interface ApplicationDetailProps {
  application: {
    id: string;
    full_name: string;
    email: string;
    org_name: string;
    org_type: string;
    org_website: string | null;
    phone: string;
    city: string;
    state: string | null;
    country: string;
    purpose: string;
    approval_status: string;
    approval_notes: string | null;
    created_at: string;
  };
}

export function ApplicationDetail({ application }: ApplicationDetailProps) {
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  async function handleApprove() {
    setLoading(true);
    const res = await approveApplicationAction(application.id);
    setResult(res);
    setLoading(false);
  }

  async function handleReject() {
    if (!rejectReason.trim()) return;
    setLoading(true);
    const res = await rejectApplicationAction(application.id, rejectReason);
    setResult(res);
    setLoading(false);
    setShowRejectModal(false);
  }

  const isPending = application.approval_status === "submitted" || application.approval_status === "under_review";

  const fields = [
    { label: "Full Name", value: application.full_name },
    { label: "Email", value: application.email },
    { label: "Phone", value: application.phone },
    { label: "Organization", value: application.org_name },
    { label: "Organization Type", value: application.org_type },
    { label: "Website", value: application.org_website || "—" },
    { label: "City", value: application.city },
    { label: "State", value: application.state || "—" },
    { label: "Country", value: application.country },
    { label: "Submitted", value: new Date(application.created_at).toLocaleString() },
  ];

  return (
    <div>
      {result?.success && (
        <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", color: "var(--success)" }}>
          Action completed successfully.
        </div>
      )}
      {result?.error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", color: "var(--danger)" }}>
          {result.error}
        </div>
      )}

      {/* Application Details */}
      <div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 className="text-lg font-bold">Application Details</h2>
          <span className={`badge ${application.approval_status === "approved" ? "badge-success" : application.approval_status === "rejected" ? "badge-danger" : "badge-warning"}`}>
            {application.approval_status}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {fields.map((f) => (
            <div key={f.label}>
              <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>{f.label}</p>
              <p style={{ fontWeight: 500 }}>{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Purpose */}
      <div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
        <h3 className="font-bold mb-3">Purpose & Description</h3>
        <p style={{ color: "var(--muted-foreground)", lineHeight: 1.7 }}>{application.purpose}</p>
      </div>

      {/* Admin Notes */}
      {application.approval_notes && (
        <div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
          <h3 className="font-bold mb-3">Admin Notes</h3>
          <p style={{ color: "var(--muted-foreground)", lineHeight: 1.7 }}>{application.approval_notes}</p>
        </div>
      )}

      {/* Actions */}
      {isPending && (
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={handleApprove} className="btn-success" disabled={loading}>
            {loading ? "Processing..." : "✓ Approve Application"}
          </button>
          <button onClick={() => setShowRejectModal(true)} className="btn-danger" disabled={loading}>
            ✗ Reject Application
          </button>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div className="glass-card" style={{ padding: "32px", width: "100%", maxWidth: "480px" }}>
            <h3 className="text-lg font-bold mb-4">Reject Application</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginBottom: "16px" }}>
              Please provide a reason for rejection. This will be sent to the applicant.
            </p>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="input-field" rows={4} placeholder="Reason for rejection..." style={{ marginBottom: "16px", resize: "vertical" }} />
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowRejectModal(false)} className="btn-secondary" style={{ padding: "10px 20px" }}>Cancel</button>
              <button onClick={handleReject} className="btn-danger" disabled={!rejectReason.trim() || loading} style={{ padding: "10px 20px" }}>
                {loading ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

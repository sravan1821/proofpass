"use client";

import { useState } from "react";
import { createEventAction } from "../actions";

const CATEGORIES = ["Hackathon", "Workshop", "Seminar", "Conference", "Competition", "Webinar", "Other"];
const MODES = [
  { value: "in_person", label: "In-Person" },
  { value: "online", label: "Online" },
  { value: "hybrid", label: "Hybrid" },
];

export default function NewEventPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createEventAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "700px" }}>
      <h1 className="text-2xl font-bold mb-2">Create New Event</h1>
      <p style={{ color: "var(--muted-foreground)", marginBottom: "32px" }}>Set up your event to start collecting registrations</p>

      <div className="glass-card" style={{ padding: "32px" }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", color: "var(--danger)", fontSize: "0.875rem" }}>{error}</div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Event Name *</label>
            <input type="text" name="name" required className="input-field" placeholder="TechFest 2026" />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Description *</label>
            <textarea name="description" required rows={4} className="input-field" placeholder="Describe your event..." style={{ resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Category *</label>
              <select name="category" required className="input-field">
                <option value="">Select category...</option>
                {CATEGORIES.map((c) => <option key={c} value={c.toLowerCase()}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Event Mode</label>
              <select name="eventMode" className="input-field">
                {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Start Date *</label>
              <input type="date" name="startDate" required className="input-field" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>End Date</label>
              <input type="date" name="endDate" className="input-field" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Event Code</label>
              <input type="text" name="eventCode" className="input-field" placeholder="TF" maxLength={4} />
              <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "4px" }}>2-4 chars, used in certificate IDs</p>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Expected Participants</label>
              <input type="number" name="expectedParticipants" className="input-field" placeholder="100" min={1} />
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Venue / Platform</label>
            <input type="text" name="venueDetails" className="input-field" placeholder="JNTU Innovation Hall / Zoom" />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";
import {
  addParticipantAction,
  deleteParticipantAction,
  sendEventUpdateEmailAction,
  updateEventStatusAction,
  updateParticipantCategoryAction,
} from "../actions";

interface EventDetailClientProps {
  event: Record<string, unknown>;
  participants: Array<Record<string, unknown>>;
  registrations: Array<Record<string, unknown>>;
}

export function EventDetailClient({ event, participants, registrations }: EventDetailClientProps) {
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [mailSubject, setMailSubject] = useState(`${String(event.name)} update`);
  const [mailMessage, setMailMessage] = useState("");
  const [mailAudience, setMailAudience] = useState("all");

  async function handleStatusChange(status: string) {
    setLoading(true);
    const result = await updateEventStatusAction(event.id as string, status);
    if (result?.error) setMsg(result.error);
    setLoading(false);
  }

  async function handleAddParticipant(eventForm: React.FormEvent<HTMLFormElement>) {
    eventForm.preventDefault();
    setLoading(true);
    const formData = new FormData(eventForm.currentTarget);
    formData.set("eventId", event.id as string);
    const result = await addParticipantAction(formData);
    if (result?.error) setMsg(result.error);
    else setShowAddParticipant(false);
    setLoading(false);
  }

  async function handleCategoryChange(participantId: string, category: string) {
    await updateParticipantCategoryAction(participantId, category, event.id as string);
  }

  async function handleDelete(participantId: string) {
    if (confirm("Remove this participant?")) {
      await deleteParticipantAction(participantId, event.id as string);
    }
  }

  async function handleSendUpdate() {
    setLoading(true);
    const result = await sendEventUpdateEmailAction(event.id as string, mailSubject, mailMessage, mailAudience);
    if (result?.error) setMsg(result.error);
    else setMsg(`Sent update to ${result.count} registrant(s).`);
    setLoading(false);
  }

  const statusFlow: Record<string, { label: string; next: string }[]> = {
    draft: [{ label: "Publish", next: "published" }],
    published: [{ label: "Mark Active", next: "active" }],
    active: [{ label: "Mark Completed", next: "completed" }],
    completed: [{ label: "Archive", next: "archived" }],
    archived: [],
  };

  const categoryColors: Record<string, string> = {
    winner: "badge-gold",
    runner_up: "badge-silver",
    participant: "badge-info",
  };

  return (
    <div>
      {msg ? (
        <div style={{ background: msg.toLowerCase().includes("sent") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${msg.toLowerCase().includes("sent") ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: "10px", padding: "12px", marginBottom: "16px", color: msg.toLowerCase().includes("sent") ? "var(--success)" : "var(--danger)", fontSize: "0.875rem" }}>
          {msg}
        </div>
      ) : null}

      <div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <h1 className="text-2xl font-bold mb-1">{event.name as string}</h1>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>{event.description as string}</p>
          </div>
          <span className={`badge ${event.status === "completed" ? "badge-success" : event.status === "draft" ? "badge-neutral" : "badge-info"}`}>
            {event.status as string}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" }}>
          {[
            { label: "Start Date", value: event.start_date ? new Date(event.start_date as string).toLocaleDateString() : "—" },
            { label: "End Date", value: event.end_date ? new Date(event.end_date as string).toLocaleDateString() : "—" },
            { label: "Category", value: (event.category as string) || "—" },
            { label: "Mode", value: (event.event_mode as string)?.replace("_", " ") || "—" },
          ].map((item) => (
            <div key={item.label}>
              <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
              <p style={{ fontWeight: 500, marginTop: "4px", textTransform: "capitalize" }}>{item.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {(statusFlow[(event.status as string)] || []).map((action) => (
            <button key={action.next} onClick={() => handleStatusChange(action.next)} className="btn-primary" disabled={loading} style={{ padding: "8px 20px", fontSize: "0.875rem" }}>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
        <div className="inline-flex items-center gap-2" style={{ marginBottom: "14px", color: "var(--primary-soft)" }}>
          <Mail size={18} />
          <h2 className="text-lg font-bold" style={{ margin: 0 }}>Registrant Updates</h2>
        </div>
        <p style={{ color: "var(--muted-foreground)", marginBottom: "16px" }}>
          Send schedule changes, venue notes, and event updates through your configured SMTP inbox.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "12px", marginBottom: "12px" }}>
          <select value={mailAudience} onChange={(eventSelect) => setMailAudience(eventSelect.target.value)} className="input-field">
            <option value="all">All Registrants</option>
            <option value="paid">Paid Registrants</option>
            <option value="pending">Pending Payment</option>
          </select>
          <input value={mailSubject} onChange={(eventInput) => setMailSubject(eventInput.target.value)} className="input-field" placeholder="Email subject" />
        </div>
        <textarea value={mailMessage} onChange={(eventInput) => setMailMessage(eventInput.target.value)} className="input-field" rows={5} placeholder="Write the update you want to send to attendees..." style={{ resize: "vertical", marginBottom: "12px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "var(--muted-foreground)", fontSize: "0.84rem" }}>
            {registrations.filter((registration) => registration.email).length} registrant(s) currently have email addresses on file.
          </span>
          <button onClick={handleSendUpdate} className="btn-primary" disabled={loading || !mailSubject.trim() || !mailMessage.trim()}>
            <Send size={16} />
            {loading ? "Sending..." : "Send Update"}
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 className="text-lg font-bold">Participants ({participants.length})</h2>
          <button onClick={() => setShowAddParticipant(true)} className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
            + Add Participant
          </button>
        </div>

        {showAddParticipant ? (
          <form onSubmit={handleAddParticipant} style={{ background: "rgba(79,70,229,0.05)", borderRadius: "10px", padding: "20px", marginBottom: "16px", border: "1px solid rgba(79,70,229,0.1)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 2fr", gap: "12px", marginBottom: "12px" }}>
              <input type="text" name="fullName" required className="input-field" placeholder="Full Name" />
              <input type="email" name="email" className="input-field" placeholder="Email" />
              <select name="category" className="input-field">
                <option value="participant">Participant</option>
                <option value="winner">Winner</option>
                <option value="runner_up">Runner-Up</option>
              </select>
              <input type="text" name="achievementDetail" className="input-field" placeholder="Achievement detail" />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "8px 16px", fontSize: "0.85rem" }}>Add</button>
              <button type="button" onClick={() => setShowAddParticipant(false)} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>Cancel</button>
            </div>
          </form>
        ) : null}

        {participants.length === 0 ? (
          <p style={{ color: "var(--muted-foreground)", textAlign: "center", padding: "32px 0" }}>No participants yet. Add participants manually or link a form.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Name", "Email", "Category", "Achievement", "Actions"].map((heading) => (
                  <th key={heading} style={{ padding: "10px 12px", textAlign: "left", fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => (
                <tr key={participant.id as string} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "12px", fontWeight: 500 }}>{participant.full_name as string}</td>
                  <td style={{ padding: "12px", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>{(participant.email as string) || "—"}</td>
                  <td style={{ padding: "12px" }}>
                    <select value={participant.category as string} onChange={(eventSelect) => handleCategoryChange(participant.id as string, eventSelect.target.value)} style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer" }} className={`badge ${categoryColors[participant.category as string] || "badge-info"}`}>
                      <option value="participant">Participant</option>
                      <option value="winner">Winner</option>
                      <option value="runner_up">Runner-Up</option>
                    </select>
                  </td>
                  <td style={{ padding: "12px", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>{(participant.achievement_detail as string) || "—"}</td>
                  <td style={{ padding: "12px" }}>
                    <button onClick={() => handleDelete(participant.id as string)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.8rem" }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { CalendarDays, ClipboardCheck, Clock3, Coins, MapPin, Sparkles, Ticket, Users } from "lucide-react";
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
  const [name, setName] = useState("AI Builders Evening");
  const [mode, setMode] = useState("in_person");
  const [fee, setFee] = useState("499");
  const [date, setDate] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const result = await createEventAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "1180px" }}>
      <div style={{ marginBottom: "28px" }}>
        <span className="badge badge-info" style={{ marginBottom: "14px" }}>Luma-inspired setup</span>
        <h1 className="text-3xl font-bold" style={{ marginBottom: "10px", maxWidth: "760px", lineHeight: 1.02 }}>
          Create an event page that sells the experience before the first registration lands.
        </h1>
        <p style={{ color: "var(--muted-foreground)", maxWidth: "760px", lineHeight: 1.7 }}>
          Set the basics, define pricing, add the highlights people care about, and launch into a registration flow built for real organizers.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.9fr", gap: "24px", alignItems: "start" }}>
        <div className="glass-card" style={{ padding: "30px" }}>
          <form onSubmit={handleSubmit}>
            {error ? (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px", color: "var(--danger)", fontSize: "0.875rem" }}>
                {error}
              </div>
            ) : null}

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Event Name *</label>
              <input
                type="text"
                name="name"
                required
                className="input-field"
                placeholder="AI Builders Evening"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Description *</label>
              <textarea
                name="description"
                required
                rows={5}
                className="input-field"
                placeholder="Describe the event, who it is for, and why people should register."
                style={{ resize: "vertical" }}
                defaultValue="A curated evening for founders, designers, and engineers building applied AI products. Expect sharp talks, ambitious demos, and a room full of people who ship."
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Category *</label>
                <select name="category" required className="input-field" defaultValue="conference">
                  <option value="">Select category...</option>
                  {CATEGORIES.map((category) => <option key={category} value={category.toLowerCase()}>{category}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Event Mode</label>
                <select name="eventMode" className="input-field" value={mode} onChange={(event) => setMode(event.target.value)}>
                  {MODES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Display Organizer Name</label>
                <input type="text" name="orgNameDisplay" className="input-field" placeholder="ProofPass Labs" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Start Date *</label>
                <input type="date" name="startDate" required className="input-field" value={date} onChange={(event) => setDate(event.target.value)} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>End Date</label>
                <input type="date" name="endDate" className="input-field" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Time</label>
                <input type="text" name="eventTime" className="input-field" placeholder="6:30 PM to 9:30 PM" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Venue / Platform</label>
                <input type="text" name="venueDetails" className="input-field" placeholder="Bangalore Design District / Zoom" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Expected Participants</label>
                <input type="number" name="expectedParticipants" className="input-field" placeholder="120" min={1} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Registration Fee (INR)</label>
                <input type="number" name="registrationFee" className="input-field" min={0} value={fee} onChange={(event) => setFee(event.target.value)} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "22px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Event Code</label>
                <input type="text" name="eventCode" className="input-field" placeholder="AIBE" maxLength={4} />
                <p style={{ fontSize: "0.74rem", color: "var(--muted-foreground)", marginTop: "4px" }}>Used in certificate IDs and internal tracking.</p>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Audience Highlights</label>
                <textarea
                  name="advantages"
                  rows={4}
                  className="input-field"
                  placeholder={"One benefit per line"}
                  style={{ resize: "vertical" }}
                  defaultValue={"Live product demos\nCurated founder networking\nOperator-led tactical sessions"}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Creating..." : "Create Event Workspace"}
            </button>
          </form>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="glass-card" style={{ padding: "24px", overflow: "hidden" }}>
            <div style={{ marginBottom: "18px" }}>
              <span className="badge badge-success" style={{ marginBottom: "10px" }}>{mode.replace("_", " ")}</span>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "8px", lineHeight: 1.1 }}>{name || "Untitled Event"}</h2>
              <p style={{ color: "var(--muted-foreground)", lineHeight: 1.6, margin: 0 }}>
                Preview how the event setup will feel once your registration funnel is live.
              </p>
            </div>
            <div style={{ display: "grid", gap: "10px" }}>
              {[
                { icon: <CalendarDays size={16} />, label: date ? new Date(date).toLocaleDateString() : "Choose your event date" },
                { icon: <Clock3 size={16} />, label: "Add a schedule or time window" },
                { icon: <MapPin size={16} />, label: mode === "online" ? "Online meeting link or platform" : "Venue or hybrid access details" },
                { icon: <Coins size={16} />, label: Number(fee) > 0 ? `Paid ticket · ₹${fee}` : "Free registration" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ color: "var(--primary-soft)" }}>{item.icon}</span>
                  <span style={{ fontSize: "0.88rem", color: "var(--foreground)" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: "24px" }}>
            <div className="inline-flex items-center gap-2" style={{ marginBottom: "12px", color: "var(--primary-soft)" }}>
              <Sparkles size={18} />
              <span className="font-semibold">What this unlocks</span>
            </div>
            <div style={{ display: "grid", gap: "10px" }}>
              {[
                { icon: <Ticket size={16} />, text: "Collect registrations with a linked form and branded event page." },
                { icon: <Users size={16} />, text: "Track participant flow, winners, and certificate issuance from one workspace." },
                { icon: <ClipboardCheck size={16} />, text: "Move from event setup to form builder without rebuilding the basics." },
              ].map((item) => (
                <div key={item.text} style={{ display: "flex", gap: "10px", alignItems: "flex-start", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                  <span style={{ color: "var(--primary-soft)", marginTop: "3px" }}>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

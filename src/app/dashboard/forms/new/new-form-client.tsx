"use client";

import { useState } from "react";
import { CalendarDays, ClipboardCheck, FileText, LayoutTemplate, MessageSquareText, Sparkles } from "lucide-react";
import { createFormAction } from "../actions";

interface NewFormClientProps {
  events: Array<{ id: string; name: string; start_date?: string | null; status?: string | null }>;
}

const TEMPLATES = [
  {
    value: "registration",
    label: "Registration",
    description: "Full name, email, phone, organization, and intent fields.",
    icon: <ClipboardCheck size={18} />,
  },
  {
    value: "check_in",
    label: "Check-in",
    description: "Fast event-day capture for attendees at the door.",
    icon: <CalendarDays size={18} />,
  },
  {
    value: "feedback",
    label: "Feedback",
    description: "Ratings plus open-ended responses after the event.",
    icon: <MessageSquareText size={18} />,
  },
  {
    value: "blank",
    label: "Blank Builder",
    description: "Start from scratch and design every field yourself.",
    icon: <LayoutTemplate size={18} />,
  },
] as const;

export function NewFormClient({ events }: NewFormClientProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<(typeof TEMPLATES)[number]["value"]>("registration");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const result = await createFormAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "1180px" }}>
      <div style={{ marginBottom: "28px" }}>
        <span className="badge badge-info" style={{ marginBottom: "14px" }}>Google-Forms style builder</span>
        <h1 className="text-3xl font-bold" style={{ marginBottom: "10px", maxWidth: "700px", lineHeight: 1.05 }}>
          Launch a registration flow that feels polished before you even open the builder.
        </h1>
        <p style={{ color: "var(--muted-foreground)", maxWidth: "760px", lineHeight: 1.7 }}>
          Create an event-linked form, pick a starter template, and drop directly into the builder with the right fields already in place.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.9fr", gap: "24px", alignItems: "start" }}>
        <div className="glass-card" style={{ padding: "30px" }}>
          <form onSubmit={handleSubmit}>
            {error ? (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "12px 14px", marginBottom: "20px", color: "var(--danger)", fontSize: "0.875rem" }}>
                {error}
              </div>
            ) : null}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Form Title *</label>
                <input type="text" name="title" required className="input-field" placeholder="AI Summit Registration" defaultValue="Event Registration Form" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Link to Event</label>
                <select name="eventId" className="input-field" defaultValue="">
                  <option value="">Standalone form</option>
                  {events.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}{item.start_date ? ` · ${new Date(item.start_date).toLocaleDateString()}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "22px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Description</label>
              <textarea
                name="description"
                className="input-field"
                rows={4}
                placeholder="Tell attendees what this form is for, what happens after submission, and any deadlines."
                style={{ resize: "vertical" }}
                defaultValue="Collect registrations, basic attendee details, and planning context before the event."
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Start From a Template</label>
                <span style={{ fontSize: "0.74rem", color: "var(--muted-foreground)" }}>Inspired by Google Forms</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {TEMPLATES.map((template) => {
                  const selected = selectedTemplate === template.value;
                  return (
                    <label
                      key={template.value}
                      style={{
                        display: "block",
                        border: selected ? "1px solid rgba(88,115,255,0.45)" : "1px solid var(--border)",
                        background: selected ? "rgba(88,115,255,0.09)" : "rgba(255,255,255,0.02)",
                        borderRadius: "18px",
                        padding: "16px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="template"
                        value={template.value}
                        checked={selected}
                        onChange={() => setSelectedTemplate(template.value)}
                        style={{ display: "none" }}
                      />
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", color: selected ? "var(--foreground)" : "var(--muted-foreground)" }}>
                        <span style={{ color: "var(--primary-soft)" }}>{template.icon}</span>
                        <span className="font-semibold">{template.label}</span>
                      </div>
                      <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", lineHeight: 1.6, margin: 0 }}>{template.description}</p>
                    </label>
                  );
                })}
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Creating..." : "Create Form and Open Builder"}
            </button>
          </form>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="glass-card" style={{ padding: "24px" }}>
            <div className="inline-flex items-center gap-2" style={{ marginBottom: "12px", color: "var(--primary-soft)" }}>
              <Sparkles size={18} />
              <span className="font-semibold">Organizer Workflow</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                "Link the form to an event so responses stay attached to the right program.",
                "Start from a proven template instead of rebuilding common fields each time.",
                "Open the builder with a ready structure, then customize labels, rules, and fields.",
              ].map((point) => (
                <div key={point} style={{ padding: "12px 14px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: "24px" }}>
            <div className="inline-flex items-center gap-2" style={{ marginBottom: "12px", color: "var(--primary-soft)" }}>
              <FileText size={18} />
              <span className="font-semibold">Template Preview</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(selectedTemplate === "registration"
                ? ["Full Name", "Email Address", "Phone Number", "College / Organization", "Why do you want to attend?"]
                : selectedTemplate === "check_in"
                  ? ["Full Name", "Email Address", "Registration ID"]
                  : selectedTemplate === "feedback"
                    ? ["Full Name", "Event Rating", "What worked well?", "What should we improve?"]
                    : ["Blank canvas"])
                .map((field) => (
                  <div key={field} style={{ padding: "11px 14px", borderRadius: "14px", background: "rgba(9,17,32,0.9)", border: "1px solid var(--border)", fontSize: "0.88rem" }}>
                    {field}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

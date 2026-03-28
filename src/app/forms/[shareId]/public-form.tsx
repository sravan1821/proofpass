"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { Star } from "lucide-react";
import type { FormField } from "@/lib/form-builder/types";

interface PublicFormClientProps {
  form: {
    id: string;
    title: string;
    description: string | null;
    fields_json: FormField[];
    settings_json: Record<string, unknown>;
    status: string;
    share_id: string;
    org_name?: string;
  };
}

export function PublicFormClient({ form }: PublicFormClientProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");

  const fields = form.fields_json || [];
  const settings = form.settings_json || {};

  function setValue(fieldId: string, value: unknown) {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Check required fields
    for (const field of fields) {
      if (field.required && !values[field.id] && field.type !== "section_header" && field.type !== "image_banner") {
        setError(`"${field.label}" is required.`);
        return;
      }
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/forms/${form.share_id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: values }),
      });
      const result = await res.json();

      if (result.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
        setConfirmMessage(result.confirmationMessage || "Thank you for your response!");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  if (form.status !== "published") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>Form Closed</h2>
          <p style={{ color: "#64748b" }}>{(settings.closedMessage as string) || "This form is no longer accepting responses."}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center", padding: "40px", maxWidth: "500px" }}>
          <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#dcfce7", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>Response Submitted!</h2>
          <p style={{ color: "#64748b" }}>{confirmMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px 16px" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        {/* Form Header */}
        <div style={{ background: "white", borderRadius: "12px", padding: "32px", marginBottom: "16px", borderTop: "4px solid #4f46e5", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>{form.title}</h1>
          {form.description && <p style={{ color: "#64748b", lineHeight: 1.6 }}>{form.description}</p>}
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", color: "#dc2626", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          {fields.map((field) => (
            <div key={field.id} style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              {field.type === "section_header" ? (
                <>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1e293b" }}>{field.label}</h3>
                  {field.description && <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "4px" }}>{field.description}</p>}
                </>
              ) : field.type === "image_banner" ? (
                field.imageUrl && <img src={field.imageUrl} alt={field.label} style={{ width: "100%", borderRadius: "8px" }} />
              ) : (
                <>
                  <label style={{ display: "block", fontWeight: 500, color: "#1e293b", marginBottom: "8px", fontSize: "0.95rem" }}>
                    {field.label}
                    {field.required && <span style={{ color: "#dc2626" }}> *</span>}
                  </label>

                  {(field.type === "short_text" || field.type === "email" || field.type === "phone") && (
                    <input
                      type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                      value={(values[field.id] as string) || ""}
                      onChange={(e) => setValue(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.95rem", outline: "none" }}
                    />
                  )}

                  {field.type === "long_text" && (
                    <textarea
                      value={(values[field.id] as string) || ""}
                      onChange={(e) => setValue(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      rows={4}
                      style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.95rem", resize: "vertical", outline: "none" }}
                    />
                  )}

                  {field.type === "number" && (
                    <input
                      type="number"
                      value={(values[field.id] as string) || ""}
                      onChange={(e) => setValue(field.id, e.target.value)}
                      min={field.minValue}
                      max={field.maxValue}
                      style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.95rem", outline: "none" }}
                    />
                  )}

                  {field.type === "dropdown" && (
                    <select
                      value={(values[field.id] as string) || ""}
                      onChange={(e) => setValue(field.id, e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.95rem", outline: "none", background: "white" }}
                    >
                      <option value="">Select...</option>
                      {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  )}

                  {field.type === "radio" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {field.options?.map((opt) => (
                        <label key={opt} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.95rem", color: "#374151" }}>
                          <input type="radio" name={field.id} value={opt} checked={values[field.id] === opt} onChange={() => setValue(field.id, opt)} style={{ accentColor: "#4f46e5" }} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  )}

                  {field.type === "checkbox" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {field.options?.map((opt) => (
                        <label key={opt} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.95rem", color: "#374151" }}>
                          <input
                            type="checkbox"
                            checked={((values[field.id] as string[]) || []).includes(opt)}
                            onChange={(e) => {
                              const current = (values[field.id] as string[]) || [];
                              setValue(field.id, e.target.checked ? [...current, opt] : current.filter((v) => v !== opt));
                            }}
                            style={{ accentColor: "#4f46e5" }}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  )}

                  {field.type === "date" && (
                    <input type="date" value={(values[field.id] as string) || ""} onChange={(e) => setValue(field.id, e.target.value)} style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.95rem", outline: "none" }} />
                  )}

                  {field.type === "time" && (
                    <input type="time" value={(values[field.id] as string) || ""} onChange={(e) => setValue(field.id, e.target.value)} style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.95rem", outline: "none" }} />
                  )}

                  {field.type === "rating" && (
                    <div style={{ display: "flex", gap: "4px" }}>
                      {Array.from({ length: field.ratingScale || 5 }, (_, i) => i + 1).map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setValue(field.id, star)}
                          style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", opacity: star <= ((values[field.id] as number) || 0) ? 1 : 0.3 }}
                        >
                          <Star size={22} fill={star <= ((values[field.id] as number) || 0) ? "#f59e0b" : "transparent"} color="#f59e0b" />
                        </button>
                      ))}
                    </div>
                  )}

                  {field.type === "file_upload" && (
                    <input type="file" onChange={(e) => setValue(field.id, e.target.files?.[0]?.name || "")} style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.95rem" }} />
                  )}
                </>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{ padding: "12px 32px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "0.8rem", color: "#94a3b8" }}>
          Powered by <strong>ProofPass</strong>
        </p>
      </div>
    </div>
  );
}

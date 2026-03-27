"use client";

import { useState } from "react";
import { createFormAction } from "../actions";

export default function NewFormPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createFormAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "600px" }}>
      <h1 className="text-2xl font-bold mb-2">Create New Form</h1>
      <p style={{ color: "var(--muted-foreground)", marginBottom: "32px" }}>Set up your form, then add fields in the builder</p>

      <div className="glass-card" style={{ padding: "32px" }}>
        <form onSubmit={handleSubmit}>
          {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px", marginBottom: "20px", color: "var(--danger)", fontSize: "0.875rem" }}>{error}</div>}

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Form Title *</label>
            <input type="text" name="title" required className="input-field" placeholder="Event Registration Form" />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Description</label>
            <textarea name="description" className="input-field" rows={3} placeholder="Brief description of this form..." style={{ resize: "vertical" }} />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Creating..." : "Create & Open Builder →"}
          </button>
        </form>
      </div>
    </div>
  );
}

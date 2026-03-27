"use client";

import { useState, useCallback } from "react";
import { saveFormAction, publishFormAction, closeFormAction } from "../../actions";
import type { FormField, FormSettings, FieldType } from "@/lib/form-builder/types";
import { FIELD_TYPE_META, createDefaultField, DEFAULT_FORM_SETTINGS } from "@/lib/form-builder/types";

interface FormBuilderClientProps {
  formId: string;
  initialFields: FormField[];
  initialSettings: FormSettings;
  initialTitle: string;
  initialDescription: string;
  formStatus: string;
  shareId: string;
}

export function FormBuilderClient({
  formId,
  initialFields,
  initialSettings,
  initialTitle,
  initialDescription,
  formStatus,
  shareId,
}: FormBuilderClientProps) {
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [settings] = useState<FormSettings>(initialSettings || DEFAULT_FORM_SETTINGS);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState(formStatus);

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMsg("");
    const result = await saveFormAction(formId, fields, settings);
    if (result?.error) setMsg(result.error);
    else setMsg("Saved!");
    setSaving(false);
    setTimeout(() => setMsg(""), 2000);
  }, [formId, fields, settings]);

  async function handlePublish() {
    await handleSave();
    const result = await publishFormAction(formId);
    if (result?.error) setMsg(result.error);
    else { setMsg("Published!"); setStatus("published"); }
  }

  async function handleClose() {
    const result = await closeFormAction(formId);
    if (result?.error) setMsg(result.error);
    else { setMsg("Form closed"); setStatus("closed"); }
  }

  function addField(type: FieldType) {
    const newField = createDefaultField(type);
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  }

  function removeField(fieldId: string) {
    setFields(fields.filter((f) => f.id !== fieldId));
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  }

  function duplicateField(fieldId: string) {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;
    const copy = { ...field, id: crypto.randomUUID(), label: field.label + " (copy)" };
    const idx = fields.findIndex((f) => f.id === fieldId);
    const newFields = [...fields];
    newFields.splice(idx + 1, 0, copy);
    setFields(newFields);
  }

  function moveField(fieldId: string, direction: "up" | "down") {
    const idx = fields.findIndex((f) => f.id === fieldId);
    if ((direction === "up" && idx <= 0) || (direction === "down" && idx >= fields.length - 1)) return;
    const newFields = [...fields];
    const swap = direction === "up" ? idx - 1 : idx + 1;
    [newFields[idx], newFields[swap]] = [newFields[swap], newFields[idx]];
    setFields(newFields);
  }

  function updateField(fieldId: string, updates: Partial<FormField>) {
    setFields(fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)));
  }

  // Group field types
  const groups = Object.entries(FIELD_TYPE_META).reduce((acc, [type, meta]) => {
    if (!acc[meta.group]) acc[meta.group] = [];
    acc[meta.group].push({ type: type as FieldType, ...meta });
    return acc;
  }, {} as Record<string, Array<{ type: FieldType; label: string; icon: string }>>);

  return (
    <div style={{ display: "flex", gap: "20px", minHeight: "calc(100vh - 100px)" }}>
      {/* Left: Form Canvas */}
      <div style={{ flex: "1 1 60%" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", padding: "12px 16px", background: "rgba(14,21,40,0.6)", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-bold">{initialTitle}</h2>
              <span className={`badge ${status === "published" ? "badge-success" : status === "closed" ? "badge-warning" : "badge-neutral"}`}>{status}</span>
            </div>
            {initialDescription ? (
              <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: "4px" }}>{initialDescription}</p>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {msg && <span style={{ fontSize: "0.8rem", color: msg.includes("!") ? "var(--success)" : "var(--danger)" }}>{msg}</span>}
            <button onClick={handleSave} className="btn-secondary" disabled={saving} style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
              {saving ? "Saving..." : "Save"}
            </button>
            {status === "draft" && (
              <button onClick={handlePublish} className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>Publish</button>
            )}
            {status === "published" && (
              <button onClick={handleClose} className="btn-danger" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>Close Form</button>
            )}
          </div>
        </div>

        {/* Share URL */}
        {status === "published" && (
          <div style={{ marginBottom: "16px", padding: "12px 16px", background: "rgba(16,185,129,0.06)", borderRadius: "10px", border: "1px solid rgba(16,185,129,0.15)", fontSize: "0.85rem" }}>
            <span style={{ color: "var(--muted-foreground)" }}>Share URL: </span>
            <code style={{ color: "var(--success)" }}>/forms/{shareId}</code>
          </div>
        )}

        {/* Form Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {fields.length === 0 && (
            <div className="glass-card" style={{ padding: "60px 32px", textAlign: "center" }}>
              <p style={{ color: "var(--muted-foreground)", fontSize: "1rem", marginBottom: "8px" }}>No fields yet</p>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.85rem" }}>Click a field type on the right to add it →</p>
            </div>
          )}

          {fields.map((field, idx) => (
            <div
              key={field.id}
              onClick={() => setSelectedFieldId(field.id)}
              style={{
                padding: "16px 20px",
                borderRadius: "12px",
                border: selectedFieldId === field.id ? "2px solid var(--primary)" : "1px solid var(--border)",
                background: selectedFieldId === field.id ? "rgba(79,70,229,0.05)" : "rgba(14,21,40,0.4)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: "1rem" }}>{FIELD_TYPE_META[field.type]?.icon}</span>
                  <span className="font-semibold" style={{ fontSize: "0.95rem" }}>{field.label}</span>
                  {field.required && <span style={{ color: "var(--danger)", fontSize: "0.8rem" }}>*</span>}
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button onClick={(e) => { e.stopPropagation(); moveField(field.id, "up"); }} style={{ background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer", padding: "4px", fontSize: "0.75rem" }} disabled={idx === 0}>↑</button>
                  <button onClick={(e) => { e.stopPropagation(); moveField(field.id, "down"); }} style={{ background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer", padding: "4px", fontSize: "0.75rem" }} disabled={idx === fields.length - 1}>↓</button>
                  <button onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }} style={{ background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer", padding: "4px", fontSize: "0.75rem" }}>⊕</button>
                  <button onClick={(e) => { e.stopPropagation(); removeField(field.id); }} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: "4px", fontSize: "0.75rem" }}>✕</button>
                </div>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                {FIELD_TYPE_META[field.type]?.label}
                {field.placeholder && <> • {field.placeholder}</>}
                {field.options && <> • {field.options.length} options</>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Field Palette + Properties */}
      <div style={{ width: "300px", flexShrink: 0 }}>
        {/* Properties Panel */}
        {selectedField && (
          <div className="glass-card" style={{ padding: "20px", marginBottom: "16px" }}>
            <h3 className="font-bold mb-4" style={{ fontSize: "0.9rem" }}>Field Properties</h3>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Label</label>
              <input type="text" value={selectedField.label} onChange={(e) => updateField(selectedField.id, { label: e.target.value })} className="input-field" style={{ padding: "8px 12px", fontSize: "0.85rem" }} />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Placeholder</label>
              <input type="text" value={selectedField.placeholder || ""} onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })} className="input-field" style={{ padding: "8px 12px", fontSize: "0.85rem" }} />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", fontSize: "0.85rem", color: "var(--muted-foreground)", cursor: "pointer" }}>
              <input type="checkbox" checked={selectedField.required} onChange={(e) => updateField(selectedField.id, { required: e.target.checked })} style={{ accentColor: "var(--primary)" }} />
              Required field
            </label>

            {/* Options for choice fields */}
            {selectedField.options && (
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Options</label>
                {selectedField.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2" style={{ marginBottom: "6px" }}>
                    <input type="text" value={opt} onChange={(e) => {
                      const newOpts = [...(selectedField.options || [])];
                      newOpts[i] = e.target.value;
                      updateField(selectedField.id, { options: newOpts });
                    }} className="input-field" style={{ padding: "6px 10px", fontSize: "0.8rem", flex: 1 }} />
                    <button onClick={() => {
                      const newOpts = (selectedField.options || []).filter((_, j) => j !== i);
                      updateField(selectedField.id, { options: newOpts });
                    }} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.8rem" }}>✕</button>
                  </div>
                ))}
                <button onClick={() => updateField(selectedField.id, { options: [...(selectedField.options || []), `Option ${(selectedField.options || []).length + 1}`] })} style={{ background: "none", border: "none", color: "var(--primary-soft)", cursor: "pointer", fontSize: "0.8rem", marginTop: "4px" }}>
                  + Add option
                </button>
              </div>
            )}

            {/* Rating scale */}
            {selectedField.type === "rating" && (
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Max Rating</label>
                <select value={selectedField.ratingScale || 5} onChange={(e) => updateField(selectedField.id, { ratingScale: parseInt(e.target.value) })} className="input-field" style={{ padding: "8px 12px", fontSize: "0.85rem" }}>
                  <option value={5}>5 stars</option>
                  <option value={10}>10 stars</option>
                </select>
              </div>
            )}

            {selectedField.type === "number" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Min</label>
                  <input type="number" value={selectedField.minValue ?? ""} onChange={(e) => updateField(selectedField.id, { minValue: e.target.value ? parseInt(e.target.value) : undefined })} className="input-field" style={{ padding: "8px 12px", fontSize: "0.85rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Max</label>
                  <input type="number" value={selectedField.maxValue ?? ""} onChange={(e) => updateField(selectedField.id, { maxValue: e.target.value ? parseInt(e.target.value) : undefined })} className="input-field" style={{ padding: "8px 12px", fontSize: "0.85rem" }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Field Palette */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <h3 className="font-bold mb-4" style={{ fontSize: "0.9rem" }}>Add Field</h3>
          {Object.entries(groups).map(([group, items]) => (
            <div key={group} style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>{group}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {items.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => addField(item.type)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", background: "transparent", border: "none", color: "var(--foreground)", cursor: "pointer", fontSize: "0.85rem", textAlign: "left", transition: "background 0.15s", width: "100%" }}
                    className="hover:bg-[rgba(79,70,229,0.08)]"
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

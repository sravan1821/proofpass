"use client";

import { useCallback, useState } from "react";
import {
  AlignLeft,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  ChevronsUpDown,
  CircleDot,
  Clock3,
  CopyPlus,
  Hash,
  Heading,
  ImageIcon,
  Mail,
  Paperclip,
  Phone,
  SquareCheck,
  Star,
  TextCursorInput,
  Trash2,
} from "lucide-react";
import { closeFormAction, publishFormAction, saveFormAction } from "../../actions";
import type { FieldType, FormField, FormSettings } from "@/lib/form-builder/types";
import { createDefaultField, DEFAULT_FORM_SETTINGS, FIELD_TYPE_META } from "@/lib/form-builder/types";

interface FormBuilderClientProps {
  formId: string;
  initialFields: FormField[];
  initialSettings: FormSettings;
  initialTitle: string;
  initialDescription: string;
  formStatus: string;
  shareId: string;
}

function renderFieldTypeIcon(icon: string) {
  const props = { size: 16, strokeWidth: 1.8 };

  switch (icon) {
    case "text-cursor":
      return <TextCursorInput {...props} />;
    case "align-left":
      return <AlignLeft {...props} />;
    case "mail":
      return <Mail {...props} />;
    case "phone":
      return <Phone {...props} />;
    case "chevrons-up-down":
      return <ChevronsUpDown {...props} />;
    case "circle-dot":
      return <CircleDot {...props} />;
    case "square-check":
      return <SquareCheck {...props} />;
    case "calendar-days":
      return <CalendarDays {...props} />;
    case "clock-3":
      return <Clock3 {...props} />;
    case "paperclip":
      return <Paperclip {...props} />;
    case "hash":
      return <Hash {...props} />;
    case "star":
      return <Star {...props} />;
    case "heading":
      return <Heading {...props} />;
    case "image":
      return <ImageIcon {...props} />;
    default:
      return <TextCursorInput {...props} />;
  }
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

  const selectedField = fields.find((field) => field.id === selectedFieldId);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMsg("");
    const result = await saveFormAction(formId, fields, settings);
    if (result?.error) setMsg(result.error);
    else setMsg("Saved!");
    setSaving(false);
    setTimeout(() => setMsg(""), 2000);
  }, [fields, formId, settings]);

  async function handlePublish() {
    await handleSave();
    const result = await publishFormAction(formId);
    if (result?.error) setMsg(result.error);
    else {
      setMsg("Published!");
      setStatus("published");
    }
  }

  async function handleClose() {
    const result = await closeFormAction(formId);
    if (result?.error) setMsg(result.error);
    else {
      setMsg("Form closed");
      setStatus("closed");
    }
  }

  function addField(type: FieldType) {
    const newField = createDefaultField(type);
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  }

  function removeField(fieldId: string) {
    setFields(fields.filter((field) => field.id !== fieldId));
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  }

  function duplicateField(fieldId: string) {
    const field = fields.find((item) => item.id === fieldId);
    if (!field) return;

    const copy = {
      ...field,
      id: crypto.randomUUID(),
      label: `${field.label} (copy)`,
    };
    const index = fields.findIndex((item) => item.id === fieldId);
    const nextFields = [...fields];
    nextFields.splice(index + 1, 0, copy);
    setFields(nextFields);
  }

  function moveField(fieldId: string, direction: "up" | "down") {
    const index = fields.findIndex((field) => field.id === fieldId);
    if ((direction === "up" && index <= 0) || (direction === "down" && index >= fields.length - 1)) return;

    const nextFields = [...fields];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [nextFields[index], nextFields[swapIndex]] = [nextFields[swapIndex], nextFields[index]];
    setFields(nextFields);
  }

  function updateField(fieldId: string, updates: Partial<FormField>) {
    setFields(fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)));
  }

  const groups = Object.entries(FIELD_TYPE_META).reduce((acc, [type, meta]) => {
    if (!acc[meta.group]) acc[meta.group] = [];
    acc[meta.group].push({ type: type as FieldType, ...meta });
    return acc;
  }, {} as Record<string, Array<{ type: FieldType; label: string; icon: string }>>);

  return (
    <div style={{ display: "flex", gap: "20px", minHeight: "calc(100vh - 100px)" }}>
      <div style={{ flex: "1 1 60%" }}>
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

        {status === "published" && (
          <div style={{ marginBottom: "16px", padding: "12px 16px", background: "rgba(16,185,129,0.06)", borderRadius: "10px", border: "1px solid rgba(16,185,129,0.15)", fontSize: "0.85rem" }}>
            <span style={{ color: "var(--muted-foreground)" }}>Share URL: </span>
            <code style={{ color: "var(--success)" }}>/forms/{shareId}</code>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {fields.length === 0 && (
            <div className="glass-card" style={{ padding: "60px 32px", textAlign: "center" }}>
              <p style={{ color: "var(--muted-foreground)", fontSize: "1rem", marginBottom: "8px" }}>No fields yet</p>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.85rem" }}>Click a field type on the right to add it.</p>
            </div>
          )}

          {fields.map((field, index) => (
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
                  <span style={{ color: "var(--primary-soft)" }}>{renderFieldTypeIcon(FIELD_TYPE_META[field.type]?.icon)}</span>
                  <span className="font-semibold" style={{ fontSize: "0.95rem" }}>{field.label}</span>
                  {field.required && <span style={{ color: "var(--danger)", fontSize: "0.8rem" }}>*</span>}
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button onClick={(event) => { event.stopPropagation(); moveField(field.id, "up"); }} style={{ background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer", padding: "4px" }} disabled={index === 0}><ArrowUp size={14} /></button>
                  <button onClick={(event) => { event.stopPropagation(); moveField(field.id, "down"); }} style={{ background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer", padding: "4px" }} disabled={index === fields.length - 1}><ArrowDown size={14} /></button>
                  <button onClick={(event) => { event.stopPropagation(); duplicateField(field.id); }} style={{ background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer", padding: "4px" }}><CopyPlus size={14} /></button>
                  <button onClick={(event) => { event.stopPropagation(); removeField(field.id); }} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: "4px" }}><Trash2 size={14} /></button>
                </div>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                {FIELD_TYPE_META[field.type]?.label}
                {field.placeholder && <> - {field.placeholder}</>}
                {field.options && <> - {field.options.length} options</>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: "300px", flexShrink: 0 }}>
        {selectedField && (
          <div className="glass-card" style={{ padding: "20px", marginBottom: "16px" }}>
            <h3 className="font-bold mb-4" style={{ fontSize: "0.9rem" }}>Field Properties</h3>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Label</label>
              <input type="text" value={selectedField.label} onChange={(event) => updateField(selectedField.id, { label: event.target.value })} className="input-field" style={{ padding: "8px 12px", fontSize: "0.85rem" }} />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Placeholder</label>
              <input type="text" value={selectedField.placeholder || ""} onChange={(event) => updateField(selectedField.id, { placeholder: event.target.value })} className="input-field" style={{ padding: "8px 12px", fontSize: "0.85rem" }} />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", fontSize: "0.85rem", color: "var(--muted-foreground)", cursor: "pointer" }}>
              <input type="checkbox" checked={selectedField.required} onChange={(event) => updateField(selectedField.id, { required: event.target.checked })} style={{ accentColor: "var(--primary)" }} />
              Required field
            </label>

            {selectedField.options && (
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Options</label>
                {selectedField.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2" style={{ marginBottom: "6px" }}>
                    <input
                      type="text"
                      value={option}
                      onChange={(event) => {
                        const nextOptions = [...(selectedField.options || [])];
                        nextOptions[optionIndex] = event.target.value;
                        updateField(selectedField.id, { options: nextOptions });
                      }}
                      className="input-field"
                      style={{ padding: "6px 10px", fontSize: "0.8rem", flex: 1 }}
                    />
                    <button
                      onClick={() => {
                        const nextOptions = (selectedField.options || []).filter((_, listIndex) => listIndex !== optionIndex);
                        updateField(selectedField.id, { options: nextOptions });
                      }}
                      style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: 0 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button onClick={() => updateField(selectedField.id, { options: [...(selectedField.options || []), `Option ${(selectedField.options || []).length + 1}`] })} style={{ background: "none", border: "none", color: "var(--primary-soft)", cursor: "pointer", fontSize: "0.8rem", marginTop: "4px" }}>
                  + Add option
                </button>
              </div>
            )}

            {selectedField.type === "rating" && (
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Max Rating</label>
                <select value={selectedField.ratingScale || 5} onChange={(event) => updateField(selectedField.id, { ratingScale: parseInt(event.target.value, 10) })} className="input-field" style={{ padding: "8px 12px", fontSize: "0.85rem" }}>
                  <option value={5}>5 stars</option>
                  <option value={10}>10 stars</option>
                </select>
              </div>
            )}

            {selectedField.type === "number" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Min</label>
                  <input type="number" value={selectedField.minValue ?? ""} onChange={(event) => updateField(selectedField.id, { minValue: event.target.value ? parseInt(event.target.value, 10) : undefined })} className="input-field" style={{ padding: "8px 12px", fontSize: "0.85rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Max</label>
                  <input type="number" value={selectedField.maxValue ?? ""} onChange={(event) => updateField(selectedField.id, { maxValue: event.target.value ? parseInt(event.target.value, 10) : undefined })} className="input-field" style={{ padding: "8px 12px", fontSize: "0.85rem" }} />
                </div>
              </div>
            )}
          </div>
        )}

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
                    <span style={{ color: "var(--primary-soft)" }}>{renderFieldTypeIcon(item.icon)}</span>
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

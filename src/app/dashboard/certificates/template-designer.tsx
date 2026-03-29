"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { MousePointer2, Move, Trash2 } from "lucide-react";

import { CertificateSurface } from "@/components/certificates/certificate-surface";
import {
  CERTIFICATE_FIELD_DEFINITIONS,
  buildCertificateValueMap,
  createDefaultPlacement,
  PREVIEW_ISSUE_DATE,
  type CertificateFieldSourceKey,
  type CertificateTemplateLayout,
  type CertificateTemplatePlacement,
} from "@/lib/certificates/fields";
import type { CertificateTemplate } from "@/lib/certificates/templates";

interface TemplateDesignerProps {
  layout: CertificateTemplateLayout;
  onChange: (layout: CertificateTemplateLayout) => void;
  assetDataUrl?: string;
  assetType?: "pdf" | "image";
  assetName?: string;
  templateName: string;
  signerName: string;
  signerTitle: string;
  signatureDataUrl?: string;
  signer2Name: string;
  signer2Title: string;
  signature2DataUrl?: string;
  registrations: Array<Record<string, unknown>>;
  events: Array<Record<string, unknown>>;
  organizationName?: string | null;
}

type DragState = {
  placementId: string;
  offsetX: number;
  offsetY: number;
} | null;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function placementHeight(placement: CertificateTemplatePlacement) {
  if (placement.kind === "qr") return placement.height ?? placement.width;
  if (placement.kind === "image") return placement.height ?? placement.width * 0.56;
  return placement.height ?? 0.09;
}

function clampPlacement(placement: CertificateTemplatePlacement) {
  const height = placementHeight(placement);

  return {
    ...placement,
    x: clamp(placement.x, 0, Math.max(0, 1 - placement.width)),
    y: clamp(placement.y, 0, Math.max(0, 1 - height)),
  };
}

function renderPreviewPlacement(
  placement: CertificateTemplatePlacement,
  value: string | undefined,
  selected: boolean,
  compact = false,
) {
  const commonStyle = {
    position: "absolute" as const,
    left: `${placement.x * 100}%`,
    top: `${placement.y * 100}%`,
    width: `${placement.width * 100}%`,
    borderRadius: selected ? "14px" : "12px",
    border: selected ? "2px solid rgba(88, 115, 255, 0.8)" : "1px dashed rgba(88, 115, 255, 0.45)",
    background: selected ? "rgba(88, 115, 255, 0.12)" : "rgba(255, 255, 255, 0.18)",
    boxShadow: selected ? "0 8px 24px rgba(88, 115, 255, 0.18)" : "none",
    cursor: "grab",
    overflow: "hidden" as const,
    userSelect: "none" as const,
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
  };

  if (placement.kind === "qr") {
    return {
      ...commonStyle,
      height: `${placementHeight(placement) * 100}%`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#1f2937",
      fontSize: compact ? "0.58rem" : "0.76rem",
      fontWeight: 700,
    };
  }

  if (placement.kind === "image") {
    return {
      ...commonStyle,
      height: `${placementHeight(placement) * 100}%`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#1f2937",
      fontSize: compact ? "0.58rem" : "0.76rem",
      padding: compact ? "4px" : "8px",
    };
  }

  return {
    ...commonStyle,
    color: placement.color ?? "#111827",
    fontSize: `max(10px, ${(placement.fontSize ?? 0.024) * 100}cqw)`,
    fontWeight: placement.bold ? 700 : 500,
    textAlign: placement.align ?? "left",
    lineHeight: 1.15,
    padding: compact ? "4px 6px" : "8px 10px",
    minHeight: `${placementHeight(placement) * 100}%`,
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
    display: "flex",
    alignItems: "center",
    justifyContent:
      placement.align === "center" ? "center" : placement.align === "right" ? "flex-end" : "flex-start",
  };
}

export function TemplateDesigner({
  layout,
  onChange,
  assetDataUrl,
  assetType,
  assetName,
  templateName,
  signerName,
  signerTitle,
  signatureDataUrl,
  signer2Name,
  signer2Title,
  signature2DataUrl,
  registrations,
  events,
  organizationName,
}: TemplateDesignerProps) {
  const [selectedFieldKey, setSelectedFieldKey] = useState<CertificateFieldSourceKey | null>(null);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(layout.placements[0]?.id ?? null);
  const [sampleRegistrationId, setSampleRegistrationId] = useState<string>(String(registrations[0]?.id ?? ""));

  const previewRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState>(null);
  const layoutRef = useRef(layout);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!layout.placements.some((placement) => placement.id === selectedPlacementId)) {
      setSelectedPlacementId(layout.placements[0]?.id ?? null);
    }
  }, [layout.placements, selectedPlacementId]);

  useEffect(() => {
    if (!registrations.some((registration) => String(registration.id) === sampleRegistrationId)) {
      setSampleRegistrationId(String(registrations[0]?.id ?? ""));
    }
  }, [registrations, sampleRegistrationId]);

  const sampleRegistration = useMemo(
    () => registrations.find((registration) => String(registration.id) === sampleRegistrationId) ?? registrations[0] ?? null,
    [registrations, sampleRegistrationId],
  );

  const sampleEvent = useMemo(() => {
    const eventId = String(sampleRegistration?.event_id ?? "");
    return events.find((event) => String(event.id) === eventId) ?? events[0] ?? null;
  }, [events, sampleRegistration]);

  const sampleValues = useMemo(
    () => ({
      ...buildCertificateValueMap({
        registration: sampleRegistration,
        event: sampleEvent,
        organizationName: organizationName ?? "ProofPass",
        certificateId: "PP-2026-DEMO-00001",
        issueDate: PREVIEW_ISSUE_DATE,
        verificationUrl: "https://proofpass.in/verify/PP-2026-DEMO-00001",
        signerName,
        signerTitle,
        signatureDataUrl,
        signer2Name,
        signer2Title,
        signature2DataUrl,
      }),
      verification_qr: "",
    }),
    [
      organizationName,
      sampleEvent,
      sampleRegistration,
      signature2DataUrl,
      signatureDataUrl,
      signer2Name,
      signer2Title,
      signerName,
      signerTitle,
    ],
  );

  const previewTemplate = useMemo<CertificateTemplate>(
    () => ({
      id: "custom-preview",
      name: templateName || "Custom Certificate Template",
      source: "custom",
      label: assetType === "image" ? "Custom image" : "Custom PDF",
      accent: "linear-gradient(135deg, #8fdcff 0%, #5873ff 100%)",
      frame: "rgba(143,220,255,0.18)",
      paper: "linear-gradient(160deg, #0b1220 0%, #121b2d 100%)",
      ink: "#eff5ff",
      badge: "#8fdcff",
      sampleRecipient: String(sampleValues.recipient_name || "Participant Name"),
      sampleAchievement: String(sampleValues.achievement || "Achievement"),
      assetType,
      assetDataUrl,
      assetName,
      signerName,
      signerTitle,
      signatureDataUrl,
      signer2Name,
      signer2Title,
      signature2DataUrl,
      layout,
    }),
    [
      assetDataUrl,
      assetName,
      assetType,
      layout,
      sampleValues.achievement,
      sampleValues.recipient_name,
      signature2DataUrl,
      signatureDataUrl,
      signer2Name,
      signer2Title,
      signerName,
      signerTitle,
      templateName,
    ],
  );

  const selectedPlacement = layout.placements.find((placement) => placement.id === selectedPlacementId) ?? null;

  const groupedFields = useMemo(() => {
    const groups: Array<{ key: string; title: string }> = [
      { key: "registration", title: "Registered User Fields" },
      { key: "event", title: "Event Fields" },
      { key: "system", title: "System Fields" },
      { key: "signatory", title: "Signatory Fields" },
    ];

    return groups.map((group) => ({
      ...group,
      fields: CERTIFICATE_FIELD_DEFINITIONS.filter((field) => field.group === group.key),
    }));
  }, []);

  function getPoint(clientX: number, clientY: number) {
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return null;

    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  }

  function updatePlacements(nextPlacements: CertificateTemplatePlacement[]) {
    onChange({
      ...layoutRef.current,
      placements: nextPlacements,
    });
  }

  function upsertPlacement(sourceKey: CertificateFieldSourceKey, pointX: number, pointY: number) {
    const currentLayout = layoutRef.current;
    const existingPlacement = currentLayout.placements.find((placement) => placement.sourceKey === sourceKey);
    const nextPlacement = clampPlacement(
      existingPlacement
        ? {
            ...existingPlacement,
            x: pointX,
            y: pointY,
          }
        : {
            ...createDefaultPlacement(sourceKey),
            x: pointX,
            y: pointY,
          },
    );

    const nextPlacements = existingPlacement
      ? currentLayout.placements.map((placement) =>
          placement.sourceKey === sourceKey ? nextPlacement : placement,
        )
      : [...currentLayout.placements, nextPlacement];

    updatePlacements(nextPlacements);
    setSelectedPlacementId(nextPlacement.id);
  }

  function handleCanvasClick(event: MouseEvent<HTMLDivElement>) {
    if (!selectedFieldKey || !assetDataUrl) return;

    const point = getPoint(event.clientX, event.clientY);
    if (!point) return;

    const field = CERTIFICATE_FIELD_DEFINITIONS.find((item) => item.sourceKey === selectedFieldKey);
    const pointX = clamp(point.x, 0, 1 - (field?.defaultWidth ?? 0.2));
    const pointY = clamp(point.y, 0, 1 - (field?.defaultHeight ?? 0.08));

    upsertPlacement(selectedFieldKey, pointX, pointY);
  }

  function startDrag(event: ReactPointerEvent<HTMLDivElement>, placementId: string) {
    event.preventDefault();
    event.stopPropagation();

    const point = getPoint(event.clientX, event.clientY);
    const placement = layoutRef.current.placements.find((item) => item.id === placementId);
    if (!point || !placement) return;

    dragStateRef.current = {
      placementId,
      offsetX: point.x - placement.x,
      offsetY: point.y - placement.y,
    };
    setSelectedPlacementId(placementId);
  }

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (!dragStateRef.current) return;
      const point = getPoint(event.clientX, event.clientY);
      if (!point) return;

      const currentLayout = layoutRef.current;
      const placement = currentLayout.placements.find((item) => item.id === dragStateRef.current?.placementId);
      if (!placement) return;

      const nextPlacement = clampPlacement({
        ...placement,
        x: point.x - dragStateRef.current.offsetX,
        y: point.y - dragStateRef.current.offsetY,
      });

      updatePlacements(
        currentLayout.placements.map((item) => (item.id === nextPlacement.id ? nextPlacement : item)),
      );
    }

    function handlePointerUp() {
      dragStateRef.current = null;
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  function updateSelectedPlacement(patch: Partial<CertificateTemplatePlacement>) {
    if (!selectedPlacement) return;

    updatePlacements(
      layout.placements.map((placement) =>
        placement.id === selectedPlacement.id ? clampPlacement({ ...placement, ...patch }) : placement,
      ),
    );
  }

  function removeSelectedPlacement() {
    if (!selectedPlacement) return;

    const nextPlacements = layout.placements.filter((placement) => placement.id !== selectedPlacement.id);
    updatePlacements(nextPlacements);
    setSelectedPlacementId(nextPlacements[0]?.id ?? null);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px minmax(0, 1fr)", gap: "18px", alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ padding: "14px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
          <div className="inline-flex items-center gap-2" style={{ color: "var(--primary-soft)", marginBottom: "10px" }}>
            <MousePointer2 size={16} />
            <span className="font-semibold">Interactive Placeholder Builder</span>
          </div>
          <p style={{ fontSize: "0.84rem", color: "var(--muted-foreground)", lineHeight: 1.6, margin: 0 }}>
            Choose a field, then click on the template to place it. Drag any placed field to fine-tune its position.
          </p>
        </div>

        <div style={{ padding: "14px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "0.82rem", color: "var(--muted-foreground)" }}>Preview with registered user</label>
          <select className="input-field" value={sampleRegistrationId} onChange={(event) => setSampleRegistrationId(event.target.value)}>
            {registrations.length === 0 ? <option value="">No registrations yet</option> : null}
            {registrations.map((registration) => (
              <option key={String(registration.id)} value={String(registration.id)}>
                {String(registration.full_name || "Participant")} • {String(registration.email || sampleEvent?.name || "Registration")}
              </option>
            ))}
          </select>
          <p style={{ fontSize: "0.76rem", color: "var(--muted-foreground)", marginTop: "8px", marginBottom: 0 }}>
            Use real registered users to preview how names, achievements, and event fields will appear.
          </p>
        </div>

        {groupedFields.map((group) => (
          <div key={group.key} style={{ padding: "14px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: "10px", fontWeight: 600 }}>
              {group.title}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {group.fields.map((field) => {
                const placed = layout.placements.some((placement) => placement.sourceKey === field.sourceKey);
                const selected = selectedFieldKey === field.sourceKey || selectedPlacement?.sourceKey === field.sourceKey;

                return (
                  <button
                    key={field.sourceKey}
                    type="button"
                    onClick={() => {
                      setSelectedFieldKey(field.sourceKey);
                      const existingPlacement = layout.placements.find((placement) => placement.sourceKey === field.sourceKey);
                      if (existingPlacement) {
                        setSelectedPlacementId(existingPlacement.id);
                      }
                    }}
                    className={selected ? "btn-primary" : "btn-secondary"}
                    style={{ padding: "8px 10px", fontSize: "0.78rem", gap: "6px" }}
                  >
                    {field.label}
                    {placed ? <span className="badge badge-success" style={{ padding: "2px 6px", fontSize: "0.62rem" }}>Placed</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ padding: "14px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <div className="inline-flex items-center gap-2" style={{ color: "var(--primary-soft)" }}>
              <Move size={16} />
              <span className="font-semibold">Selected Field Settings</span>
            </div>
            {selectedPlacement ? (
              <button type="button" onClick={removeSelectedPlacement} className="btn-secondary" style={{ padding: "6px 10px", fontSize: "0.76rem" }}>
                <Trash2 size={14} />
                Remove
              </button>
            ) : null}
          </div>

          {!selectedPlacement ? (
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.84rem", lineHeight: 1.6, margin: 0 }}>
              Select a placed field to adjust width, font, alignment, or size.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                    Left Position ({Math.round(selectedPlacement.x * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(0, 1 - selectedPlacement.width)}
                    step="0.005"
                    value={selectedPlacement.x}
                    onChange={(event) => updateSelectedPlacement({ x: Number(event.target.value) })}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                    Top Position ({Math.round(selectedPlacement.y * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(0, 1 - placementHeight(selectedPlacement))}
                    step="0.005"
                    value={selectedPlacement.y}
                    onChange={(event) => updateSelectedPlacement({ y: Number(event.target.value) })}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                  Width ({Math.round(selectedPlacement.width * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.08"
                  max="0.9"
                  step="0.01"
                  value={selectedPlacement.width}
                  onChange={(event) => updateSelectedPlacement({ width: Number(event.target.value) })}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                  Height ({Math.round((placementHeight(selectedPlacement) || 0) * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.03"
                  max="0.4"
                  step="0.01"
                  value={placementHeight(selectedPlacement)}
                  onChange={(event) => updateSelectedPlacement({ height: Number(event.target.value) })}
                  style={{ width: "100%" }}
                />
              </div>

              {selectedPlacement.kind === "text" ? (
                <>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                      Font Size ({Math.round((selectedPlacement.fontSize ?? 0.024) * 1000) / 10}% of width)
                    </label>
                    <input
                      type="range"
                      min="0.012"
                      max="0.08"
                      step="0.002"
                      value={selectedPlacement.fontSize ?? 0.024}
                      onChange={(event) => updateSelectedPlacement({ fontSize: Number(event.target.value) })}
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Alignment</label>
                      <select className="input-field" value={selectedPlacement.align ?? "left"} onChange={(event) => updateSelectedPlacement({ align: event.target.value as CertificateTemplatePlacement["align"] })}>
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Text Color</label>
                      <input type="color" value={selectedPlacement.color ?? "#111827"} onChange={(event) => updateSelectedPlacement({ color: event.target.value })} style={{ width: "100%", height: "44px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", background: "transparent" }} />
                    </div>
                  </div>

                  <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "0.84rem" }}>
                    <input type="checkbox" checked={Boolean(selectedPlacement.bold)} onChange={(event) => updateSelectedPlacement({ bold: event.target.checked })} />
                    Bold text
                  </label>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
          <div>
            <h3 className="font-semibold" style={{ marginBottom: "4px" }}>Template Preview</h3>
            <p style={{ color: "var(--muted-foreground)", margin: 0, fontSize: "0.84rem" }}>
              {assetType === "pdf" ? "PDF templates use the first visible page for interactive placement." : "Image templates are ideal for pixel-perfect placement."}
            </p>
          </div>
          <span className="badge badge-neutral">{layout.placements.length} field(s) placed</span>
        </div>

        <div
          ref={previewRef}
          style={{ position: "relative", width: "100%", containerType: "inline-size" }}
          onClick={handleCanvasClick}
        >
          <div style={{ pointerEvents: "none" }}>
            <CertificateSurface template={previewTemplate} showPlacedFields={false} showTemplateMeta={false} />
          </div>

          {assetDataUrl ? (
            <div style={{ position: "absolute", inset: 0 }}>
              {layout.placements.map((placement) => {
                const previewValue = sampleValues[placement.sourceKey] || placement.label;
                const style = renderPreviewPlacement(
                  placement,
                  typeof previewValue === "string" ? previewValue : undefined,
                  selectedPlacementId === placement.id,
                );

                return (
                  <div
                    key={placement.id}
                    style={style}
                    onPointerDown={(event) => startDrag(event, placement.id)}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedPlacementId(placement.id);
                    }}
                  >
                    {placement.kind === "qr" ? (
                      <span>QR</span>
                    ) : placement.kind === "image" ? (
                      previewValue?.startsWith("data:image") ? (
                        <img src={previewValue} alt={placement.label} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      ) : (
                        <span>{placement.label}</span>
                      )
                    ) : (
                      <span>{previewValue}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

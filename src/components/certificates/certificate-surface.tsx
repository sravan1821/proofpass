import type { CSSProperties } from "react";

import {
  type CertificateFieldSourceKey,
  type CertificateTemplatePlacement,
  type CertificateTextAlign,
} from "@/lib/certificates/fields";
import { hasAssetBackedTemplateSurface, type CertificateTemplate } from "@/lib/certificates/templates";

interface CertificateSurfaceProps {
  template: CertificateTemplate;
  values?: Partial<Record<CertificateFieldSourceKey, string>>;
  compact?: boolean;
  showPlacedFields?: boolean;
  showTemplateMeta?: boolean;
  style?: CSSProperties;
}

function placementHeight(placement: CertificateTemplatePlacement) {
  if (placement.kind === "qr") return placement.height ?? placement.width;
  if (placement.kind === "image") return placement.height ?? placement.width * 0.56;
  return placement.height ?? 0.09;
}

function resolveTextRatio(placement: CertificateTemplatePlacement, rawValue: string | undefined, compact: boolean) {
  const baseRatio = placement.fontSize ?? (compact ? 0.018 : 0.024);
  if (!rawValue) return baseRatio;

  const normalizedText = rawValue.replace(/\s+/g, " ").trim();
  const budget = Math.max(22, Math.round(placement.width * (compact ? 90 : 120)));
  const overflow = normalizedText.length / budget;

  if (overflow <= 1) return baseRatio;
  return Math.max(baseRatio * 0.68, baseRatio / overflow);
}

function buildTextStyle(
  placement: CertificateTemplatePlacement,
  rawValue: string | undefined,
  compact: boolean,
): CSSProperties {
  const align = (placement.align ?? "left") as CertificateTextAlign;
  const fontRatio = resolveTextRatio(placement, rawValue, compact);
  const height = placementHeight(placement);

  return {
    position: "absolute",
    left: `${placement.x * 100}%`,
    top: `${placement.y * 100}%`,
    width: `${placement.width * 100}%`,
    height: `${height * 100}%`,
    color: placement.color ?? "#111827",
    fontSize: `max(${compact ? 8 : 10}px, ${fontRatio * 100}cqw)`,
    fontWeight: placement.bold ? 700 : 500,
    textAlign: align,
    lineHeight: 1.18,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    textShadow: "0 1px 2px rgba(255, 255, 255, 0.28)",
    display: "flex",
    alignItems: "center",
    justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
    padding: compact ? "2px 4px" : "4px 6px",
    overflow: "hidden",
  };
}

function FieldOverlay({
  template,
  values,
  compact,
}: {
  template: CertificateTemplate;
  values?: Partial<Record<CertificateFieldSourceKey, string>>;
  compact: boolean;
}) {
  const placements = template.layout?.placements ?? [];
  if (placements.length === 0) return null;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {placements.map((placement) => {
        const rawValue = values?.[placement.sourceKey];

        if (placement.kind === "qr") {
          return (
            <div
              key={placement.id}
              style={{
                position: "absolute",
                left: `${placement.x * 100}%`,
                top: `${placement.y * 100}%`,
                width: `${placement.width * 100}%`,
                height: `${placementHeight(placement) * 100}%`,
                borderRadius: compact ? "10px" : "14px",
                overflow: "hidden",
                background: rawValue?.startsWith("data:image") ? "transparent" : "rgba(17, 24, 39, 0.08)",
                border: rawValue?.startsWith("data:image") ? "none" : "1px dashed rgba(17, 24, 39, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {rawValue?.startsWith("data:image") ? (
                <img src={rawValue} alt={placement.label} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <span style={{ fontSize: compact ? "0.56rem" : "0.78rem", color: "#1f2937", fontWeight: 700 }}>QR</span>
              )}
            </div>
          );
        }

        if (placement.kind === "image") {
          return (
            <div
              key={placement.id}
              style={{
                position: "absolute",
                left: `${placement.x * 100}%`,
                top: `${placement.y * 100}%`,
                width: `${placement.width * 100}%`,
                height: `${placementHeight(placement) * 100}%`,
                borderRadius: compact ? "8px" : "12px",
                overflow: "hidden",
                background: rawValue?.startsWith("data:image") ? "transparent" : "rgba(17, 24, 39, 0.06)",
                border: rawValue?.startsWith("data:image") ? "none" : "1px dashed rgba(17, 24, 39, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {rawValue?.startsWith("data:image") ? (
                <img src={rawValue} alt={placement.label} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <span style={{ fontSize: compact ? "0.54rem" : "0.74rem", color: "#1f2937" }}>{placement.label}</span>
              )}
            </div>
          );
        }

        return (
          <div key={placement.id} style={buildTextStyle(placement, rawValue, compact)}>
            {rawValue || placement.label}
          </div>
        );
      })}
    </div>
  );
}

function CustomTemplateSurface({
  template,
  values,
  compact,
  showPlacedFields,
  showTemplateMeta = true,
  style,
}: CertificateSurfaceProps) {
  const borderRadius = compact ? "16px" : "26px";
  const aspectRatio = template.layout?.aspectRatio ?? 1.414;
  const assetType = template.assetType ?? (template.assetDataUrl?.startsWith("data:image/") ? "image" : "pdf");
  const assetSrc = template.assetDataUrl ?? template.pdfDataUrl;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio,
        borderRadius,
        overflow: "hidden",
        border: `1px solid ${template.frame}`,
        background: "#ffffff",
        boxShadow: compact ? "0 12px 36px rgba(5, 10, 24, 0.18)" : "0 28px 90px rgba(5, 10, 24, 0.2)",
        containerType: "inline-size",
        ...style,
      }}
    >
      {assetSrc ? (
        assetType === "image" ? (
          <img
            src={assetSrc}
            alt={template.name}
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", background: "#ffffff" }}
          />
        ) : (
          <iframe
            src={`${assetSrc}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            title={template.name}
            style={{ width: "100%", height: "100%", border: "none", display: "block", background: "#ffffff", pointerEvents: "none" }}
          />
        )
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", padding: "24px", textAlign: "center" }}>
          Upload a certificate template to start placing fields.
        </div>
      )}

      {showPlacedFields ? <FieldOverlay template={template} values={values} compact={Boolean(compact)} /> : null}

      {showTemplateMeta ? (
        <div
          style={{
            position: "absolute",
            left: compact ? "10px" : "16px",
            right: compact ? "10px" : "16px",
            bottom: compact ? "10px" : "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            borderRadius: compact ? "12px" : "14px",
            background: "rgba(6, 12, 24, 0.72)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#eff5ff",
            padding: compact ? "6px 10px" : "10px 14px",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: compact ? "0.72rem" : "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{template.name}</div>
            <div style={{ fontSize: compact ? "0.58rem" : "0.74rem", color: "rgba(239, 245, 255, 0.72)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {template.assetName || template.pdfName || (assetType === "image" ? "Uploaded template image" : "Uploaded certificate PDF")}
            </div>
          </div>
          <span className="badge badge-info" style={{ flexShrink: 0, fontSize: compact ? "0.56rem" : undefined, padding: compact ? "4px 8px" : undefined }}>
            {assetType === "image" ? "Template Image" : "Template PDF"}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function BuiltInTemplateSurface({
  template,
  values,
  compact,
  style,
}: CertificateSurfaceProps) {
  const recipient = values?.recipient_name || template.sampleRecipient;
  const achievement = values?.achievement || template.sampleAchievement;
  const eventName = values?.event_name || "ProofPass Event";
  const organizationName = values?.organization_name || "ProofPass";
  const certificateId = values?.certificate_id || "PP-2026-DEMO-00001";
  const issueDate = values?.issue_date || "March 28, 2026";
  const qrImage = values?.verification_qr;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: compact ? 1.48 : 1.414,
        borderRadius: compact ? "16px" : "26px",
        overflow: "hidden",
        background: template.paper,
        border: `1px solid ${template.frame}`,
        boxShadow: compact ? "0 16px 44px rgba(5, 10, 24, 0.24)" : "0 28px 90px rgba(5, 10, 24, 0.36)",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: compact ? "10px" : "18px",
          borderRadius: compact ? "12px" : "22px",
          border: `1px solid ${template.frame}`,
          background:
            "radial-gradient(circle at top left, rgba(255,255,255,0.08), transparent 28%), radial-gradient(circle at bottom right, rgba(255,255,255,0.05), transparent 24%)",
          padding: compact ? "14px" : "30px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: compact ? "8px" : "14px" }}>
          <div>
            <div style={{ color: template.badge, fontSize: compact ? "0.48rem" : "0.8rem", letterSpacing: compact ? "0.12em" : "0.18em", textTransform: "uppercase", marginBottom: compact ? "5px" : "12px" }}>
              ProofPass Credential
            </div>
            <div style={{ color: template.badge, fontSize: compact ? "0.46rem" : "0.76rem", letterSpacing: compact ? "0.08em" : "0.12em", textTransform: "uppercase", padding: compact ? "3px 6px" : "6px 12px", borderRadius: "999px", border: `1px solid ${template.frame}`, display: "inline-flex" }}>
              {template.label}
            </div>
          </div>
          <div
            style={{
              width: compact ? "28px" : "54px",
              height: compact ? "28px" : "54px",
              borderRadius: compact ? "9px" : "16px",
              background: template.accent,
              opacity: 0.95,
              boxShadow: "0 12px 34px rgba(0,0,0,0.24)",
            }}
          />
        </div>

        <div style={{ textAlign: "center", padding: compact ? "0 4px" : "0 16px", display: "flex", flexDirection: "column", justifyContent: "center", gap: compact ? "7px" : "10px" }}>
          <div style={{ color: template.ink, fontSize: compact ? "0.48rem" : "0.96rem", letterSpacing: compact ? "0.08em" : "0.14em", textTransform: "uppercase", opacity: 0.72 }}>
            Certificate of Achievement
          </div>
          <div style={{ color: template.ink, fontSize: compact ? "0.68rem" : "3rem", fontWeight: 700, letterSpacing: compact ? "-0.02em" : "-0.04em", lineHeight: compact ? 1.05 : 1.02, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {recipient}
          </div>
          <div style={{ width: compact ? "42px" : "136px", height: compact ? "2px" : "4px", margin: "0 auto", borderRadius: "999px", background: template.accent }} />
          <div style={{ color: template.ink, fontSize: compact ? "0.52rem" : "1rem", opacity: 0.84 }}>{achievement}</div>
          {!compact ? (
            <div style={{ color: template.ink, fontSize: "0.84rem", opacity: 0.74 }}>
              {eventName} • {organizationName}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "12px" }}>
          <div>
            <div style={{ width: compact ? "66px" : "112px", height: "2px", background: template.frame, marginBottom: "8px" }} />
            <div style={{ color: template.ink, opacity: 0.72, fontSize: compact ? "0.56rem" : "0.78rem" }}>{organizationName}</div>
            {!compact ? (
              <div style={{ color: template.ink, opacity: 0.58, fontSize: "0.72rem", marginTop: "4px" }}>
                {certificateId} • {issueDate}
              </div>
            ) : null}
          </div>
          {qrImage?.startsWith("data:image") ? (
            <div style={{ width: compact ? "42px" : "84px", height: compact ? "42px" : "84px", borderRadius: compact ? "10px" : "18px", overflow: "hidden", background: "rgba(255,255,255,0.92)", padding: compact ? "5px" : "10px" }}>
              <img src={qrImage} alt="Verification QR" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          ) : (
            <div style={{ color: template.ink, opacity: 0.66, fontSize: compact ? "0.48rem" : "0.76rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Verify with ProofPass
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CertificateSurface(props: CertificateSurfaceProps) {
  if (props.template.source === "custom" || hasAssetBackedTemplateSurface(props.template)) {
    return <CustomTemplateSurface {...props} />;
  }

  return <BuiltInTemplateSurface {...props} />;
}

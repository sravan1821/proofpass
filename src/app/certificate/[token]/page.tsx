import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { CertificateSurface } from "@/components/certificates/certificate-surface";
import { PrintCertificateButton } from "@/components/certificates/print-certificate-button";
import { buildCertificateViewData, type CertificateViewRow, shouldRenderFieldOverlay } from "@/lib/certificates/certificate-view";
import { createMongoServerClient } from "@/lib/db/mongo/server";

type EventRow = {
  name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  venue?: string | null;
};

export default async function PublicCertificatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createMongoServerClient();

  let certificate: CertificateViewRow | null = null;
  let event: EventRow | null = null;

  if (supabase) {
    const { data } = await supabase
      .from("certificates")
      .select("*, events(name, start_date, end_date, venue)")
      .eq("certificate_id_display", decodeURIComponent(token))
      .single();

    if (data) {
      certificate = data as CertificateViewRow;
      event = (data as { events?: EventRow | null }).events ?? null;
    } else {
      const { data: byHash } = await supabase
        .from("certificates")
        .select("*, events(name, start_date, end_date, venue)")
        .eq("token_hash", token)
        .single();

      if (byHash) {
        certificate = byHash as CertificateViewRow;
        event = (byHash as { events?: EventRow | null }).events ?? null;
      }
    }
  }

  if (!certificate) notFound();

  const { template, fieldValues } = buildCertificateViewData({
    certificate,
    event: (event as Record<string, unknown> | null) ?? null,
    organizationName: certificate.organization_name || "ProofPass",
  });

  return (
    <main style={{ minHeight: "100vh", padding: "24px", background: "radial-gradient(circle at 50% 30%, rgba(79,70,229,0.12), transparent 40%), linear-gradient(180deg, #060816 0%, #070b17 42%, #091121 100%)" }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              .public-certificate-chrome {
                display: none !important;
              }

              .public-certificate-card {
                padding: 0 !important;
                border: none !important;
                background: #ffffff !important;
                box-shadow: none !important;
              }

              body {
                background: #ffffff !important;
              }
            }
          `,
        }}
      />

      <div style={{ maxWidth: "1160px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div className="public-certificate-chrome" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <Link href={`/verify/${encodeURIComponent(token)}`} className="btn-secondary" style={{ marginBottom: "12px", width: "fit-content" }}>
              <ArrowLeft size={16} />
              Back To Verification
            </Link>
            <h1 className="text-2xl font-bold" style={{ marginBottom: "6px" }}>
              {certificate.recipient_name || "Certificate"}
            </h1>
            <p style={{ color: "var(--muted-foreground)", margin: 0 }}>
              View the issued certificate and download it as PDF.
            </p>
          </div>

          <div className="public-certificate-chrome" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <span className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={16} />
              Verified Credential
            </span>
            <a href={`/api/certificate/${encodeURIComponent(token)}/pdf?download=1`} className="btn-primary">
              Download PDF
            </a>
            <PrintCertificateButton label="Print Certificate" />
          </div>
        </div>

        <div className="glass-card public-certificate-card" style={{ padding: "20px" }}>
          <CertificateSurface
            template={template}
            values={fieldValues}
            showPlacedFields={shouldRenderFieldOverlay(template)}
            showTemplateMeta={false}
            style={{ boxShadow: "none" }}
          />
        </div>
      </div>
    </main>
  );
}

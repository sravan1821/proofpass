"use client";

export function PrintCertificateButton({ label = "Print / Save PDF" }: { label?: string }) {
  return (
    <button type="button" className="btn-primary" onClick={() => window.print()}>
      {label}
    </button>
  );
}

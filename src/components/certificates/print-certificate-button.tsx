"use client";

export function PrintCertificateButton() {
  return (
    <button type="button" className="btn-primary" onClick={() => window.print()}>
      Print / Save PDF
    </button>
  );
}

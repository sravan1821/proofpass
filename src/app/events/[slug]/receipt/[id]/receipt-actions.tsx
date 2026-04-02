"use client";

import Link from "next/link";

interface ReceiptActionsProps {
  recipientEmail: string;
  eventName: string;
  receiptUrl: string;
  receiptNumber?: string | null;
}

export function ReceiptActions({
  recipientEmail,
  eventName,
  receiptUrl,
  receiptNumber,
}: ReceiptActionsProps) {
  const subject = encodeURIComponent(`Receipt for ${eventName}`);
  const body = encodeURIComponent(
    [
      `Hi,`,
      ``,
      `Sharing your ProofPass receipt for ${eventName}.`,
      receiptNumber ? `Receipt Number: ${receiptNumber}` : "",
      `Receipt Link: ${receiptUrl}`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  const mailtoHref = `mailto:${encodeURIComponent(recipientEmail)}?subject=${subject}&body=${body}`;

  return (
    <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "center" }}>
      <button onClick={() => window.print()} className="btn-secondary" style={{ padding: "10px 20px", fontSize: "0.85rem" }}>
        Print Receipt
      </button>
      <a href={mailtoHref} className="btn-secondary" style={{ padding: "10px 20px", fontSize: "0.85rem" }}>
        Send via Mail
      </a>
      <Link href="/events" className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.85rem" }}>
        Browse More Events →
      </Link>
    </div>
  );
}

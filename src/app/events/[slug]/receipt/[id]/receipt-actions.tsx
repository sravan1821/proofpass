"use client";

import Link from "next/link";

export function ReceiptActions() {
  return (
    <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "center" }}>
      <button onClick={() => window.print()} className="btn-secondary" style={{ padding: "10px 20px", fontSize: "0.85rem" }}>
        Print Receipt
      </button>
      <Link href="/events" className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.85rem" }}>
        Browse More Events →
      </Link>
    </div>
  );
}

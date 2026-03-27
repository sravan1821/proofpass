import crypto from "node:crypto";

export function generateSerialNumber(prefix = "PP") {
  const stamp = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  const nonce = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `${prefix}-${stamp}-${nonce}`;
}

export function generatePublicToken() {
  return crypto.randomBytes(24).toString("hex");
}

export function hashCertificateToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function buildVerificationUrl(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl}/verify/${token}`;
}

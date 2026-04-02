import crypto from "node:crypto";
import { getAppUrl } from "@/lib/env";

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
  return `${getAppUrl()}/verify/${token}`;
}

import { getCertificateByToken } from "@/lib/demo-data";

export function resolveVerificationToken(token: string) {
  return getCertificateByToken(token);
}

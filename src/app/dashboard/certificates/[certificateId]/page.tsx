import { PrototypeFrame } from "@/components/shared/prototype-frame";

export default async function DashboardCertificatePage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  await params;
  return <PrototypeFrame src="/prototype/certificate.html" title="ProofPass Certificate" />;
}

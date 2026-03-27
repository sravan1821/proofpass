import { PrototypeFrame } from "@/components/shared/prototype-frame";

export default async function DashboardProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  await params;
  return <PrototypeFrame src="/prototype/certificate.html" title="ProofPass Project Editor" />;
}

import { PrototypeFrame } from "@/components/shared/prototype-frame";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  await params;
  return <PrototypeFrame src="/prototype/dashboard.html" title="ProofPass Team" />;
}

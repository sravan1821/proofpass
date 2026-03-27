import { PrototypeFrame } from "@/components/shared/prototype-frame";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await params;
  return <PrototypeFrame src="/prototype/certificate.html" title="ProofPass Project" />;
}

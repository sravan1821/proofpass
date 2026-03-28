import { requireApprovedOrganizer } from "@/lib/auth";
import { DashboardShell } from "./shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireApprovedOrganizer();

  return (
    <DashboardShell
      user={{
        fullName: user.fullName,
        orgName: user.orgName,
      }}
    >
      {children}
    </DashboardShell>
  );
}

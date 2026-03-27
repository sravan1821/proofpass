import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/db/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ApplicationDetail } from "./application-detail";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: application } = await supabase!
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!application) notFound();

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 30% 10%, rgba(220,38,38,0.08), transparent 40%), linear-gradient(180deg, #0a0606 0%, #0d0808 42%, #110a0a 100%)" }}>
      <header style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 32px", borderBottom: "1px solid rgba(220,38,38,0.12)" }}>
        <Link href="/admin" className="flex items-center gap-3">
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700 }}>A</div>
        </Link>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        <Link href="/admin/applications" style={{ color: "var(--muted-foreground)" }}>Applications</Link>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        <span>{application.org_name || application.full_name}</span>
      </header>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px" }}>
        <ApplicationDetail application={application} />
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireApprovedOrganizer } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/db/supabase/server";
import { Inbox } from "lucide-react";
import { notFound } from "next/navigation";

export default async function FormResponsesPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const user = await requireApprovedOrganizer();
  const { formId } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: form } = await supabase!
    .from("forms")
    .select("*")
    .eq("id", formId)
    .eq("organizer_id", user.id)
    .single();

  if (!form) notFound();

  const { data: responses } = (await supabase!
    .from("form_responses")
    .select("*")
    .eq("form_id", formId)
    .order("submitted_at", { ascending: false })) as { data: any[] | null };

  const fields = (form.fields_json as Array<{ id: string; label: string; type: string }>) || [];
  const inputFields = fields.filter((f) => f.type !== "section_header" && f.type !== "image_banner");

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 className="text-2xl font-bold">{form.title} — Responses</h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>{form.response_count} total responses</p>
      </div>

      {(!responses || responses.length === 0) ? (
        <div className="glass-card" style={{ padding: "60px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px", color: "var(--primary-soft)" }}><Inbox size={40} /></div>
          <h3 className="text-lg font-bold mb-2">No responses yet</h3>
          <p style={{ color: "var(--muted-foreground)" }}>Share your form to start collecting responses.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>#</th>
                {inputFields.map((field) => (
                  <th key={field.id} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, maxWidth: "200px" }}>
                    {field.label}
                  </th>
                ))}
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((resp: any, idx: number) => {
                const data = resp.data_json as Record<string, unknown>;
                return (
                  <tr key={resp.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "12px 16px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>{responses.length - idx}</td>
                    {inputFields.map((field) => (
                      <td key={field.id} style={{ padding: "12px 16px", fontSize: "0.85rem", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {data[field.id] !== undefined ? String(data[field.id]) : "—"}
                      </td>
                    ))}
                    <td style={{ padding: "12px 16px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                      {new Date(resp.submitted_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

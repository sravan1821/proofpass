import { requireApprovedOrganizer } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/db/supabase/server";
import { notFound } from "next/navigation";
import { FormBuilderClient } from "./form-builder";
import type { FormField, FormSettings } from "@/lib/form-builder/types";
import { DEFAULT_FORM_SETTINGS } from "@/lib/form-builder/types";

export default async function FormEditPage({
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

  return (
    <FormBuilderClient
      formId={form.id}
      initialFields={(form.fields_json as FormField[]) || []}
      initialSettings={(form.settings_json as FormSettings) || DEFAULT_FORM_SETTINGS}
      initialTitle={form.title}
      initialDescription={form.description || ""}
      formStatus={form.status}
      shareId={form.share_id}
    />
  );
}

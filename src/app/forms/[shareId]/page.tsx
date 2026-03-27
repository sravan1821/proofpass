import { createSupabaseServerClient } from "@/lib/db/supabase/server";
import { notFound } from "next/navigation";
import { PublicFormClient } from "./public-form";

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) notFound();

  const { data: form } = await supabase
    .from("forms")
    .select("*, profiles(org_name)")
    .eq("share_id", shareId)
    .single();

  if (!form) notFound();

  return <PublicFormClient form={{ ...form, org_name: (form.profiles as Record<string, string>)?.org_name }} />;
}

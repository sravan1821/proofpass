import { createSupabaseServerClient } from "@/lib/db/supabase/server";
import { notFound } from "next/navigation";
import RegisterForm from "./register-form";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: event } = await supabase!
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("admin_approval", "approved")
    .single();

  if (!event) notFound();

  // Fetch organizer
  let organizer = null;
  if (event.organizer_id) {
    const { data } = await supabase!
      .from("profiles")
      .select("full_name, org_name, email")
      .eq("id", event.organizer_id)
      .single();
    organizer = data;
  }

  return <RegisterForm event={event} organizer={organizer} />;
}

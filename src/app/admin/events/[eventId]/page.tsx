import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/db/supabase/server";
import { notFound } from "next/navigation";
import AdminEventDetail from "./admin-event-detail";

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  await requireAdmin();
  const { eventId } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: event } = await supabase!
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (!event) notFound();

  // Fetch organizer
  let organizer = null;
  if (event.organizer_id) {
    const { data } = await supabase!
      .from("profiles")
      .select("full_name, org_name, email, org_type, phone")
      .eq("id", event.organizer_id)
      .single();
    organizer = data;
  }

  // Fetch registrations
  const { data: registrations } = await supabase!
    .from("event_registrations")
    .select("*")
    .eq("event_id", eventId)
    .order("registered_at", { ascending: false });

  return <AdminEventDetail event={event} organizer={organizer} registrations={registrations || []} />;
}

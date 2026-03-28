import { requireApprovedOrganizer } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/db/supabase/server";
import { notFound } from "next/navigation";
import { EventDetailClient } from "./event-detail";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const user = await requireApprovedOrganizer();
  const { eventId } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: event } = await supabase!
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("organizer_id", user.id)
    .single();

  if (!event) notFound();

  const { data: participants } = await supabase!
    .from("participants")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  const { data: registrations } = await supabase!
    .from("event_registrations")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  return <EventDetailClient event={event} participants={participants || []} registrations={registrations || []} />;
}

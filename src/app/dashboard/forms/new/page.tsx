import { requireApprovedOrganizer } from "@/lib/auth";
import { createMongoServerClient } from "@/lib/db/mongo/server";
import { NewFormClient } from "./new-form-client";

export default async function NewFormPage() {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();

  const { data: events } = (await supabase!
    .from("events")
    .select("id, name, start_date, status")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false })) as {
    data: Array<{ id: string; name: string; start_date?: string | null; status?: string | null }> | null;
  };

  return <NewFormClient events={events || []} />;
}

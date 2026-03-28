import { requireApprovedOrganizer } from "@/lib/auth";
import { createMongoServerClient } from "@/lib/db/mongo/server";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();

  const { data: profile } = await supabase!
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return <SettingsClient profile={profile || null} />;
}

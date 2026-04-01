import { requireApprovedOrganizer } from "@/lib/auth";
import { createMongoServerClient } from "@/lib/db/mongo/server";
import { SettingsClient } from "./settings-client";

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export default async function SettingsPage() {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();

  const { data: profile } = await supabase!
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return <SettingsClient profile={serialize(profile || null)} />;
}

import { createMongoServerClient } from "@/lib/db/mongo/server";
import { notFound } from "next/navigation";
import RegisterForm from "./register-form";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createMongoServerClient();

  const { data: event } = await supabase!
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("admin_approval", "approved")
    .single();

  if (!event) notFound();

  // Check if event is already completed (end_date passed)
  const todayStr = new Date().toISOString().split("T")[0];
  const isCompleted = event.status === "completed" || (event.end_date && String(event.end_date) < todayStr);

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

  const serialize = <T,>(data: T): T => JSON.parse(JSON.stringify(data));
  return <RegisterForm event={serialize(event)} organizer={serialize(organizer)} isCompleted={Boolean(isCompleted)} />;
}

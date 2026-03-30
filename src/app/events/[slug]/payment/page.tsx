import { createMongoServerClient } from "@/lib/db/mongo/server";
import { notFound } from "next/navigation";
import PaymentPageClient from "./payment-client";

export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ rid?: string }>;
}) {
  const { slug } = await params;
  const { rid } = await searchParams;

  if (!rid) notFound();

  const supabase = await createMongoServerClient();

  const { data: event } = await supabase!
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!event) notFound();

  const { data: registration } = await supabase!
    .from("event_registrations")
    .select("*")
    .eq("id", rid)
    .eq("event_id", event.id)
    .single();

  if (!registration) notFound();

  const serialize = <T,>(data: T): T => JSON.parse(JSON.stringify(data));
  return <PaymentPageClient event={serialize(event)} registration={serialize(registration)} />;
}

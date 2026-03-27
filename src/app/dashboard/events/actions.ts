"use server";

import { createMongoServerClient } from "@/lib/db/mongo/server";
import { requireApprovedOrganizer } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createEventAction(formData: FormData) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const eventMode = formData.get("eventMode") as string;
  const venueDetails = formData.get("venueDetails") as string;
  const eventCode = formData.get("eventCode") as string;
  const expectedParticipants = formData.get("expectedParticipants") as string;

  if (!name || !description || !category || !startDate) {
    return { error: "Name, description, category, and start date are required." };
  }

  // Generate slug
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

  const { data, error } = await supabase.from("events").insert({
    name,
    slug,
    description,
    category,
    start_date: startDate,
    end_date: endDate || startDate,
    event_mode: eventMode || "in_person",
    venue_details: venueDetails || null,
    venue: venueDetails || null,
    event_code: eventCode || name.replace(/[^A-Z]/g, "").slice(0, 4) || name.slice(0, 2).toUpperCase(),
    expected_participants: expectedParticipants ? parseInt(expectedParticipants) : null,
    organizer_id: user.id,
    status: "draft",
  }).select().single();

  if (error) return { error: error.message };

  redirect(`/dashboard/events/${data.id}`);
}

export async function updateEventStatusAction(eventId: string, status: string) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const { error } = await supabase
    .from("events")
    .update({ status })
    .eq("id", eventId)
    .eq("organizer_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath("/dashboard/events");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function addParticipantAction(formData: FormData) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const eventId = formData.get("eventId") as string;
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const category = formData.get("category") as string;
  const achievementDetail = formData.get("achievementDetail") as string;

  if (!fullName || !eventId) return { error: "Name and event are required." };

  // Verify event belongs to user
  const { data: event } = await supabase.from("events").select("id").eq("id", eventId).eq("organizer_id", user.id).single();
  if (!event) return { error: "Event not found." };

  const { error } = await supabase.from("participants").insert({
    event_id: eventId,
    full_name: fullName,
    email: email || null,
    category: category || "participant",
    achievement_detail: achievementDetail || null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/events/${eventId}`);
  return { success: true };
}

export async function updateParticipantCategoryAction(participantId: string, category: string, eventId: string) {
  await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const { error } = await supabase
    .from("participants")
    .update({ category })
    .eq("id", participantId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/events/${eventId}`);
  return { success: true };
}

export async function deleteParticipantAction(participantId: string, eventId: string) {
  await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const { error } = await supabase.from("participants").delete().eq("id", participantId);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/events/${eventId}`);
  return { success: true };
}

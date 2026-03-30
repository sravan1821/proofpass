"use server";

import { createMongoServerClient } from "@/lib/db/mongo/server";
import { requireApprovedOrganizer } from "@/lib/auth";
import { sendOrganizerEmail } from "@/lib/mail/organizer-mail";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type EventRegistrationRecord = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  payment_status?: string | null;
};

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
  const eventTime = formData.get("eventTime") as string;
  const venueDetails = formData.get("venueDetails") as string;
  const eventCode = formData.get("eventCode") as string;
  const expectedParticipants = formData.get("expectedParticipants") as string;
  const registrationFee = formData.get("registrationFee") as string;
  const orgNameDisplay = formData.get("orgNameDisplay") as string;
  const advantages = ((formData.get("advantages") as string) || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);

  if (!name || !description || !category || !startDate) {
    return { error: "Name, description, category, and start date are required." };
  }

  // Generate slug
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

  const { error } = await supabase.from("events").insert({
    name,
    slug,
    description,
    category,
    start_date: startDate,
    end_date: endDate || startDate,
    event_mode: eventMode || "in_person",
    event_time: eventTime || null,
    venue_details: venueDetails || null,
    venue: venueDetails || null,
    event_code: eventCode || name.replace(/[^A-Z]/g, "").slice(0, 4) || name.slice(0, 2).toUpperCase(),
    expected_participants: expectedParticipants ? parseInt(expectedParticipants) : null,
    registration_fee: registrationFee ? parseInt(registrationFee) : 0,
    org_name_display: orgNameDisplay || null,
    advantages,
    organizer_id: user.id,
    status: "published",
    admin_approval: "approved",
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/events");
  revalidatePath("/dashboard");
  redirect("/dashboard/events");
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

export async function sendEventUpdateEmailAction(eventId: string, subject: string, message: string, audience: string) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  if (!subject.trim() || !message.trim()) {
    return { error: "Subject and message are required." };
  }

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("organizer_id", user.id)
    .single();

  if (!event) return { error: "Event not found." };

  const { data: registrations } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", eventId);

  const recipients = ((registrations as EventRegistrationRecord[] | null) || []).filter((registration) => {
    if (!registration.email) return false;
    if (audience === "paid") return registration.payment_status === "paid";
    if (audience === "pending") return registration.payment_status !== "paid";
    return true;
  });

  if (recipients.length === 0) {
    return { error: "No matching registrations with email addresses were found." };
  }

  for (const recipient of recipients) {
    await sendOrganizerEmail({
      organizerId: user.id,
      to: String(recipient.email),
      subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2>${event.name}</h2>
          <p>Hi ${recipient.full_name || "there"},</p>
          <p>${message.replace(/\n/g, "<br/>")}</p>
        </div>
      `,
    }).catch(() => null);
  }

  return { success: true, count: recipients.length };
}

export async function saveOverviewParticipantsAction(
  eventId: string,
  winnerId: string | null,
  runnerId: string | null
) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  // Verify event belongs to user
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("organizer_id", user.id)
    .single();

  if (!event) return { error: "Event not found." };

  // Get all registrations for this event
  const { data: registrations } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", eventId);

  if (!registrations || registrations.length === 0) {
    return { error: "No registrations found." };
  }

  // Delete existing participants for this event so we can re-create fresh
  await supabase.from("participants").delete().eq("event_id", eventId);

  const participantsToInsert = (registrations as EventRegistrationRecord[]).map((reg) => {
    let category = "participant";
    if (reg.id === winnerId) category = "winner";
    else if (reg.id === runnerId) category = "runner_up";

    return {
      event_id: eventId,
      full_name: reg.full_name,
      email: reg.email || null,
      category,
      achievement_detail:
        category === "winner"
          ? "Winner"
          : category === "runner_up"
          ? "Runner-Up"
          : "Participant",
    };
  });

  const { error } = await supabase.from("participants").insert(participantsToInsert);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath("/dashboard/certificates");
  return { success: true, count: participantsToInsert.length };
}

export async function checkInParticipantAction(registrationId: string, eventId: string) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  // Verify event belongs to user
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("organizer_id", user.id)
    .single();

  if (!event) return { error: "Event not found." };

  const { error } = await supabase
    .from("event_registrations")
    .update({
      checked_in: true,
      checked_in_at: new Date().toISOString(),
    })
    .eq("id", registrationId)
    .eq("event_id", eventId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/certificates");
  return { success: true };
}

export async function checkOutParticipantAction(registrationId: string, eventId: string) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("organizer_id", user.id)
    .single();

  if (!event) return { error: "Event not found." };

  const { error } = await supabase
    .from("event_registrations")
    .update({
      checked_in: false,
      checked_in_at: null,
    })
    .eq("id", registrationId)
    .eq("event_id", eventId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/certificates");
  return { success: true };
}

export async function bulkCheckInAction(eventId: string, registrationIds: string[]) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("organizer_id", user.id)
    .single();

  if (!event) return { error: "Event not found." };

  let count = 0;
  const now = new Date().toISOString();
  for (const regId of registrationIds) {
    const { error } = await supabase
      .from("event_registrations")
      .update({
        checked_in: true,
        checked_in_at: now,
      })
      .eq("id", regId)
      .eq("event_id", eventId);
    if (!error) count++;
  }

  revalidatePath("/dashboard/certificates");
  return { success: true, count };
}

export async function updateRegistrationDetailsAction(
  registrationId: string,
  eventId: string,
  fullName: string,
  email: string
) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  // Verify event belongs to user
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("organizer_id", user.id)
    .single();

  if (!event) return { error: "Event not found." };

  if (!fullName.trim()) return { error: "Name is required." };

  const { error } = await supabase
    .from("event_registrations")
    .update({
      full_name: fullName.trim(),
      email: email.trim() || null,
    })
    .eq("id", registrationId)
    .eq("event_id", eventId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/certificates");
  revalidatePath(`/dashboard/events/${eventId}`);
  return { success: true };
}

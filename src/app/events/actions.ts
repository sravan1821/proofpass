"use server";

import { createMongoServerClient } from "@/lib/db/mongo/server";
import { getAppBaseUrl, getOrganizerSmtpSettings, sendOrganizerEmail } from "@/lib/mail/organizer-mail";
import { revalidatePath } from "next/cache";

export async function registerForEventAction(formData: FormData) {
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const eventId = formData.get("eventId") as string;
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const collegeName = formData.get("collegeName") as string;

  const teamSize = parseInt(formData.get("teamSize") as string) || 1;
  const teamMembersRaw = formData.get("teamMembers") as string;
  let teamMembers: Array<{ name: string; email: string }> = [];
  if (teamMembersRaw) {
    try {
      teamMembers = JSON.parse(teamMembersRaw);
    } catch {
      // ignore parse errors
    }
  }

  if (!eventId || !fullName || !email) {
    return { error: "Name and email are required." };
  }

  // Check event exists and is approved
  const { data: event } = await supabase
    .from("events")
    .select("id, admin_approval, registration_deadline, slug, name, start_date, event_time, venue_details, organizer_id")
    .eq("id", eventId)
    .single();

  if (!event || event.admin_approval !== "approved") {
    return { error: "Event is not available for registration." };
  }

  // Check deadline
  if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
    return { error: "Registration deadline has passed." };
  }

  // Check duplicate email
  const { data: existing } = await supabase
    .from("event_registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("email", email)
    .single();

  if (existing) {
    return { error: "You have already registered for this event." };
  }

  // Generate receipt number
  const receipt_number = `PP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const { data, error } = await supabase
    .from("event_registrations")
    .insert({
      event_id: eventId,
      full_name: fullName,
      email,
      phone: phone || null,
      college_name: collegeName || null,
      team_size: teamSize,
      team_members: teamMembers.length > 0 ? teamMembers : null,
      payment_status: "pending",
      receipt_number,
      checked_in: false,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  const organizerSmtp = await getOrganizerSmtpSettings(String(event.organizer_id));
  if (organizerSmtp?.sendRegistrationEmails) {
    const eventUrl = `${getAppBaseUrl()}/events/${event.slug}`;
    await sendOrganizerEmail({
      organizerId: String(event.organizer_id),
      to: email,
      subject: `Registration confirmed for ${event.name}`,
      text: `Hi ${fullName}, your registration for ${event.name} is confirmed. View event details here: ${eventUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2>Registration confirmed</h2>
          <p>Hi ${fullName},</p>
          <p>Your registration for <strong>${event.name}</strong> has been received.</p>
          <p>${event.start_date ? `Date: ${new Date(event.start_date).toLocaleDateString()}<br/>` : ""}${event.event_time ? `Time: ${event.event_time}<br/>` : ""}${event.venue_details ? `Venue: ${event.venue_details}` : ""}</p>
          <p><a href="${eventUrl}">Open event page</a></p>
        </div>
      `,
    }).catch(() => null);
  }

  revalidatePath(`/events/${event.slug}`);
  return { success: true, registrationId: data.id, slug: event.slug };
}

export async function confirmPaymentAction(registrationId: string) {
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const paymentRef = `PAY-${Date.now().toString(36).toUpperCase()}`;

  const { data, error } = await supabase
    .from("event_registrations")
    .update({
      payment_status: "paid",
      payment_ref: paymentRef,
    })
    .eq("id", registrationId)
    .select("*, events(slug)")
    .single();

  if (error) return { error: error.message };

  const slug = (data.events as Record<string, unknown>)?.slug as string;

  return { success: true, registrationId: data.id, slug };
}

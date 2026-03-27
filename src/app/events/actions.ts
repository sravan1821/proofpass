"use server";

import { createSupabaseServerClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";

export async function registerForEventAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const eventId = formData.get("eventId") as string;
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const collegeName = formData.get("collegeName") as string;

  if (!eventId || !fullName || !email) {
    return { error: "Name and email are required." };
  }

  // Check event exists and is approved
  const { data: event } = await supabase
    .from("events")
    .select("id, admin_approval, registration_deadline, slug")
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
      payment_status: "pending",
      receipt_number,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/events/${event.slug}`);
  return { success: true, registrationId: data.id, slug: event.slug };
}

export async function confirmPaymentAction(registrationId: string) {
  const supabase = await createSupabaseServerClient();
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

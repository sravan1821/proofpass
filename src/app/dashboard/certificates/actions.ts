"use server";

import { createMongoServerClient } from "@/lib/db/mongo/server";
import { requireApprovedOrganizer } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function issueCertificatesAction(eventId: string) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  // Get event
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("organizer_id", user.id)
    .single();

  if (!event) return { error: "Event not found." };

  // Get participants
  const { data: participants } = await supabase
    .from("participants")
    .select("*")
    .eq("event_id", eventId);

  if (!participants || participants.length === 0) {
    return { error: "No participants to issue certificates for." };
  }

  const year = new Date().getFullYear();
  const eventCode = event.event_code || event.name.replace(/[^A-Z]/gi, "").slice(0, 4).toUpperCase() || "EV";

  // Get the current max sequence number for this event
  const { data: existingCerts } = await supabase
    .from("certificates")
    .select("certificate_id_display")
    .eq("event_id", eventId);

  let seqNum = (existingCerts?.length || 0) + 1;

  const certificatesToInsert = [];

  for (const participant of participants) {
    // Check if certificate already exists for this participant + event
    const { data: existing } = await supabase
      .from("certificates")
      .select("id")
      .eq("event_id", eventId)
      .eq("recipient_name", participant.full_name)
      .limit(1);

    if (existing && existing.length > 0) continue; // Skip duplicates

    const certIdDisplay = `PP-${year}-${eventCode}-${String(seqNum).padStart(5, "0")}`;
    const verificationUrl = `/verify/${certIdDisplay}`;
    const tokenHash = Buffer.from(certIdDisplay + Date.now()).toString("base64url");

    certificatesToInsert.push({
      event_id: eventId,
      organizer_id: user.id,
      serial_number: certIdDisplay,
      certificate_id_display: certIdDisplay,
      token_hash: tokenHash,
      recipient_name: participant.full_name,
      recipient_email: participant.email,
      category: participant.category || "participant",
      achievement_detail: participant.achievement_detail,
      organization_name: user.orgName,
      organization_logo_url: user.orgLogoUrl,
      verification_url: verificationUrl,
      qr_code_data: verificationUrl,
      status: "active",
      issued_at: new Date().toISOString(),
    });

    seqNum++;
  }

  if (certificatesToInsert.length === 0) {
    return { error: "All participants already have certificates." };
  }

  const { error } = await supabase.from("certificates").insert(certificatesToInsert);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/certificates");
  revalidatePath(`/dashboard/events/${eventId}`);
  return { success: true, count: certificatesToInsert.length };
}

export async function revokeCertificateAction(certificateId: string, reason: string) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const { error } = await supabase
    .from("certificates")
    .update({
      status: "revoked",
      revoke_reason: reason,
      revoked_at: new Date().toISOString(),
    })
    .eq("id", certificateId)
    .eq("organizer_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/certificates");
  return { success: true };
}

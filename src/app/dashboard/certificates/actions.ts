"use server";

import { createMongoServerClient } from "@/lib/db/mongo/server";
import { requireApprovedOrganizer } from "@/lib/auth";
import { getAppBaseUrl, getOrganizerSmtpSettings, sendOrganizerEmail } from "@/lib/mail/organizer-mail";
import { revalidatePath } from "next/cache";
import { CERTIFICATE_TEMPLATES } from "@/lib/certificates/templates";

async function fileToDataUrl(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export async function upsertCustomCertificateTemplateAction(formData: FormData) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const templateId = String(formData.get("templateId") || "");
  const name = String(formData.get("name") || "").trim();
  const pdfFile = formData.get("pdfFile") as File | null;
  const signatureFile = formData.get("signatureFile") as File | null;

  if (!name) return { error: "Template name is required." };

  const isEdit = Boolean(templateId);
  let existing: Record<string, unknown> | null = null;

  if (isEdit) {
    const { data } = await supabase
      .from("certificate_templates")
      .select("*")
      .eq("id", templateId)
      .eq("organizer_id", user.id)
      .single();
    existing = (data as Record<string, unknown> | null) ?? null;
    if (!existing) return { error: "Template not found." };
  }

  if (!isEdit && (!pdfFile || pdfFile.size === 0)) {
    return { error: "A PDF file is required." };
  }

  if (pdfFile && pdfFile.size > 8 * 1024 * 1024) {
    return { error: "PDF file is too large. Keep it under 8 MB." };
  }

  if (signatureFile && signatureFile.size > 3 * 1024 * 1024) {
    return { error: "Signature image is too large. Keep it under 3 MB." };
  }

  const payload = {
    organizer_id: user.id,
    name,
    source: "custom",
    pdf_name: pdfFile && pdfFile.size > 0 ? pdfFile.name : String(existing?.pdf_name || ""),
    pdf_data_url: pdfFile && pdfFile.size > 0 ? await fileToDataUrl(pdfFile) : String(existing?.pdf_data_url || ""),
    signature_data_url: signatureFile && signatureFile.size > 0 ? await fileToDataUrl(signatureFile) : String(existing?.signature_data_url || ""),
    signer_name: String(formData.get("signerName") || ""),
    signer_title: String(formData.get("signerTitle") || ""),
    placeholder_recipient_name: String(formData.get("placeholderRecipientName") || "{{recipient_name}}"),
    placeholder_achievement: String(formData.get("placeholderAchievement") || "{{achievement}}"),
    placeholder_event_name: String(formData.get("placeholderEventName") || "{{event_name}}"),
    placeholder_organization_name: String(formData.get("placeholderOrganizationName") || "{{organization_name}}"),
    placeholder_certificate_id: String(formData.get("placeholderCertificateId") || "{{certificate_id}}"),
    placeholder_issue_date: String(formData.get("placeholderIssueDate") || "{{issue_date}}"),
  };

  if (isEdit) {
    const { error } = await supabase
      .from("certificate_templates")
      .update(payload)
      .eq("id", templateId)
      .eq("organizer_id", user.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("certificate_templates").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath("/dashboard/certificates");
  return { success: true };
}

export async function issueCertificatesAction(eventId: string, templateId: string, sendEmail = false) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const builtInTemplate = CERTIFICATE_TEMPLATES.find((item) => item.id === templateId);
  const customTemplate = builtInTemplate
    ? null
    : await supabase
        .from("certificate_templates")
        .select("*")
        .eq("id", templateId)
        .eq("organizer_id", user.id)
        .single();

  const template = builtInTemplate ?? (customTemplate?.data as Record<string, unknown> | null);
  if (!template) return { error: "Template not found." };

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
  const certificateEmailQueue: Array<{ to: string; name: string; verifyUrl: string; eventName: string; certId: string }> = [];

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
      template_id: template.id as string,
      template_name: template.name as string,
      template_source: builtInTemplate ? "built_in" : "custom",
      verification_url: verificationUrl,
      qr_code_data: verificationUrl,
      status: "active",
      issued_at: new Date().toISOString(),
    });

    if (participant.email) {
      certificateEmailQueue.push({
        to: participant.email,
        name: participant.full_name,
        verifyUrl: `${getAppBaseUrl()}${verificationUrl}`,
        eventName: event.name,
        certId: certIdDisplay,
      });
    }

    seqNum++;
  }

  if (certificatesToInsert.length === 0) {
    return { error: "All participants already have certificates." };
  }

  const { error } = await supabase.from("certificates").insert(certificatesToInsert);

  if (error) return { error: error.message };

  const organizerSmtp = await getOrganizerSmtpSettings(user.id);
  if (sendEmail && organizerSmtp?.sendCertificateEmails) {
    for (const item of certificateEmailQueue) {
      await sendOrganizerEmail({
        organizerId: user.id,
        to: item.to,
        subject: `Your certificate for ${item.eventName}`,
        text: `Hi ${item.name}, your certificate has been issued. Verify it here: ${item.verifyUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
            <h2>Your certificate is ready</h2>
            <p>Hi ${item.name},</p>
            <p>Your certificate for <strong>${item.eventName}</strong> has been issued.</p>
            <p>Certificate ID: <strong>${item.certId}</strong></p>
            <p><a href="${item.verifyUrl}">Open verification page</a></p>
          </div>
        `,
      }).catch(() => null);
    }
  }

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

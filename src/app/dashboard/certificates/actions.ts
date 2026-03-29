"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import QRCode from "qrcode";

import { requireApprovedOrganizer } from "@/lib/auth";
import {
  buildCertificateValueMap,
  guessTemplateAssetType,
  parseTemplateLayout,
  type CertificateTemplateLayout,
} from "@/lib/certificates/fields";
import { mapCustomCertificateTemplate, CERTIFICATE_TEMPLATES, type CertificateTemplate } from "@/lib/certificates/templates";
import { createMongoServerClient } from "@/lib/db/mongo/server";
import { getAppBaseUrl, getOrganizerSmtpSettings, sendOrganizerEmail } from "@/lib/mail/organizer-mail";

async function fileToDataUrl(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

function normalizeName(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function getSecondarySignatory(layout?: CertificateTemplateLayout | null) {
  return layout?.meta?.secondSignatory ?? null;
}

function buildTemplateSnapshot(template: CertificateTemplate) {
  return {
    id: template.id,
    name: template.name,
    source: template.source,
    label: template.label,
    accent: template.accent,
    frame: template.frame,
    paper: template.paper,
    ink: template.ink,
    badge: template.badge,
    sampleRecipient: template.sampleRecipient,
    sampleAchievement: template.sampleAchievement,
    assetType: template.assetType,
    assetDataUrl: template.assetDataUrl ?? template.pdfDataUrl,
    assetName: template.assetName ?? template.pdfName,
    signatureDataUrl: template.signatureDataUrl,
    signerName: template.signerName,
    signerTitle: template.signerTitle,
    signature2DataUrl: template.signature2DataUrl,
    signer2Name: template.signer2Name,
    signer2Title: template.signer2Title,
    layout: template.layout,
  };
}

export async function upsertCustomCertificateTemplateAction(formData: FormData) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const templateId = String(formData.get("templateId") || "");
  const name = String(formData.get("name") || "").trim();
  const templateFile = formData.get("templateFile") as File | null;
  const signatureFile = formData.get("signatureFile") as File | null;
  const signatureFile2 = formData.get("signatureFile2") as File | null;
  const layout =
    parseTemplateLayout(formData.get("layoutJson")) ??
    ({ version: 1 as const, aspectRatio: 1.414, placements: [], meta: {} } satisfies CertificateTemplateLayout);

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

  const hiddenAssetDataUrl = String(formData.get("assetDataUrl") || "").trim();
  const hiddenAssetName = String(formData.get("assetName") || "").trim();
  const hiddenAssetType = String(formData.get("assetType") || "").trim();
  const hiddenSignatureDataUrl = String(formData.get("signatureDataUrl") || "").trim();
  const hiddenSignature2DataUrl = String(formData.get("signature2DataUrl") || "").trim();

  if (
    !isEdit &&
    (!templateFile || templateFile.size === 0) &&
    !hiddenAssetDataUrl
  ) {
    return { error: "A certificate template file is required." };
  }

  const acceptedTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
  if (templateFile && templateFile.size > 0 && !acceptedTypes.includes(templateFile.type)) {
    return { error: "Upload a PDF, PNG, JPG, or WEBP certificate template." };
  }

  if (templateFile && templateFile.size > 10 * 1024 * 1024) {
    return { error: "Template file is too large. Keep it under 10 MB." };
  }

  if (signatureFile && signatureFile.size > 3 * 1024 * 1024) {
    return { error: "Signature image is too large. Keep it under 3 MB." };
  }

  if (signatureFile2 && signatureFile2.size > 3 * 1024 * 1024) {
    return { error: "Second signature image is too large. Keep it under 3 MB." };
  }

  const existingLayout = parseTemplateLayout(existing?.layout_json);

  const assetDataUrl =
    templateFile && templateFile.size > 0
      ? await fileToDataUrl(templateFile)
      : hiddenAssetDataUrl || String(existing?.template_asset_data_url || existing?.pdf_data_url || "");

  const assetName =
    templateFile && templateFile.size > 0
      ? templateFile.name
      : hiddenAssetName || String(existing?.template_asset_name || existing?.pdf_name || "");

  const assetType =
    templateFile && templateFile.size > 0
      ? guessTemplateAssetType(templateFile.type)
      : guessTemplateAssetType(hiddenAssetType || String(existing?.template_asset_type || ""), assetDataUrl);

  const signatureDataUrl =
    signatureFile && signatureFile.size > 0
      ? await fileToDataUrl(signatureFile)
      : hiddenSignatureDataUrl || String(existing?.signature_data_url || "");

  const secondSignatory = {
    name: String(formData.get("signer2Name") || getSecondarySignatory(existingLayout)?.name || ""),
    title: String(formData.get("signer2Title") || getSecondarySignatory(existingLayout)?.title || ""),
    signatureDataUrl:
      signatureFile2 && signatureFile2.size > 0
        ? await fileToDataUrl(signatureFile2)
        : hiddenSignature2DataUrl || String(getSecondarySignatory(existingLayout)?.signatureDataUrl || ""),
  };

  const layoutWithMeta: CertificateTemplateLayout = {
    ...layout,
    meta: {
      ...(layout.meta ?? {}),
      secondSignatory:
        secondSignatory.name || secondSignatory.title || secondSignatory.signatureDataUrl
          ? secondSignatory
          : undefined,
    },
  };

  const payload = {
    organizer_id: user.id,
    name,
    source: "custom",
    template_asset_name: assetName,
    template_asset_data_url: assetDataUrl,
    template_asset_type: assetType,
    pdf_name: assetType === "pdf" ? assetName : String(existing?.pdf_name || ""),
    pdf_data_url: assetType === "pdf" ? assetDataUrl : String(existing?.pdf_data_url || ""),
    signature_data_url: signatureDataUrl,
    signer_name: String(formData.get("signerName") || ""),
    signer_title: String(formData.get("signerTitle") || ""),
    layout_json: layoutWithMeta,
    placeholder_recipient_name: "{{recipient_name}}",
    placeholder_achievement: "{{achievement}}",
    placeholder_event_name: "{{event_name}}",
    placeholder_organization_name: "{{organization_name}}",
    placeholder_certificate_id: "{{certificate_id}}",
    placeholder_issue_date: "{{issue_date}}",
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

  const builtInTemplate = CERTIFICATE_TEMPLATES.find((item) => item.id === templateId) ?? null;
  const customTemplateRecord = builtInTemplate
    ? null
    : await supabase
        .from("certificate_templates")
        .select("*")
        .eq("id", templateId)
        .eq("organizer_id", user.id)
        .single();

  const template =
    builtInTemplate ??
    (customTemplateRecord?.data ? mapCustomCertificateTemplate(customTemplateRecord.data as Record<string, unknown>) : null);
  if (!template) return { error: "Template not found." };

  if (template.source === "custom" && (!template.layout?.placements || template.layout.placements.length === 0)) {
    return { error: "Place at least one field on the custom template before bulk issuing certificates." };
  }

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("organizer_id", user.id)
    .single();

  if (!event) return { error: "Event not found." };

  const { data: registrationsData } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  const { data: participantsData } = await supabase
    .from("participants")
    .select("*")
    .eq("event_id", eventId);

  const registrations = (registrationsData as Array<Record<string, unknown>> | null) ?? [];
  const participants = (participantsData as Array<Record<string, unknown>> | null) ?? [];

  const recipients =
    registrations.length > 0
      ? registrations
      : participants.map((participant) => ({
          id: participant.id,
          full_name: participant.full_name,
          email: participant.email,
          phone: null,
          college_name: null,
          receipt_number: null,
          category: participant.category,
        }));

  if (recipients.length === 0) {
    return { error: "No registered users were found for this event." };
  }

  const participantMap = new Map<string, Record<string, unknown>>();
  for (const participant of participants) {
    const email = normalizeEmail(participant.email);
    const fullName = normalizeName(participant.full_name);
    if (email) participantMap.set(`email:${email}`, participant);
    if (fullName) participantMap.set(`name:${fullName}`, participant);
  }

  const year = new Date().getFullYear();
  const eventCode =
    String(event.event_code || "").trim() ||
    String(event.name || "")
      .replace(/[^A-Z]/gi, "")
      .slice(0, 4)
      .toUpperCase() ||
    "EV";

  const { data: existingCerts } = await supabase
    .from("certificates")
    .select("registration_id, recipient_email, recipient_name, certificate_id_display")
    .eq("event_id", eventId);

  const existingCertificates = (existingCerts as Array<Record<string, unknown>> | null) ?? [];
  const existingRegistrationIds = new Set(existingCertificates.map((item) => String(item.registration_id || "")).filter(Boolean));
  const existingEmails = new Set(existingCertificates.map((item) => normalizeEmail(item.recipient_email)).filter(Boolean));
  const existingNames = new Set(existingCertificates.map((item) => normalizeName(item.recipient_name)).filter(Boolean));

  let seqNum = existingCertificates.length + 1;

  const certificatesToInsert: Array<Record<string, unknown>> = [];
  const certificateEmailQueue: Array<{ to: string; name: string; verifyUrl: string; eventName: string; certId: string }> = [];

  for (const registration of recipients) {
    const registrationId = String(registration.id || "");
    const email = normalizeEmail(registration.email);
    const fullName = normalizeName(registration.full_name);

    if (
      (registrationId && existingRegistrationIds.has(registrationId)) ||
      (email && existingEmails.has(email)) ||
      (fullName && existingNames.has(fullName))
    ) {
      continue;
    }

    const linkedParticipant =
      participantMap.get(email ? `email:${email}` : "") ??
      participantMap.get(fullName ? `name:${fullName}` : "") ??
      null;

    const certIdDisplay = `PP-${year}-${eventCode}-${String(seqNum).padStart(5, "0")}`;
    const verificationPath = `/verify/${encodeURIComponent(certIdDisplay)}`;
    const verificationUrl = `${getAppBaseUrl()}${verificationPath}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 240,
      errorCorrectionLevel: "M",
    });
    const tokenHash = Buffer.from(certIdDisplay + Date.now() + seqNum).toString("base64url");
    const certificateRecordId = randomUUID();
    const issuedAt = new Date().toISOString();
    const organizationName =
      user.orgName ||
      (typeof event.org_name_display === "string" && event.org_name_display) ||
      "ProofPass";

    const fieldValues = buildCertificateValueMap({
      registration,
      participant: linkedParticipant,
      event,
      organizationName,
      certificateId: certIdDisplay,
      issueDate: issuedAt,
      verificationUrl,
      signerName: template.signerName ?? null,
      signerTitle: template.signerTitle ?? null,
      signatureDataUrl: template.signatureDataUrl ?? null,
      signer2Name: template.signer2Name ?? null,
      signer2Title: template.signer2Title ?? null,
      signature2DataUrl: template.signature2DataUrl ?? null,
    });
    fieldValues.verification_qr = qrCodeDataUrl;

    certificatesToInsert.push({
      id: certificateRecordId,
      event_id: eventId,
      organizer_id: user.id,
      registration_id: registrationId || null,
      serial_number: certIdDisplay,
      certificate_id_display: certIdDisplay,
      token_hash: tokenHash,
      recipient_name: registration.full_name,
      recipient_email: registration.email,
      recipient_phone: registration.phone || null,
      recipient_organization: registration.college_name || null,
      category: String(linkedParticipant?.category || registration.category || "participant"),
      achievement_detail: String(
        linkedParticipant?.achievement_detail ||
          (linkedParticipant?.category === "winner"
            ? "Winner"
            : linkedParticipant?.category === "runner_up"
              ? "Runner-Up"
              : "Participant") ||
          "Participant",
      ),
      organization_name: organizationName,
      organization_logo_url: user.orgLogoUrl,
      template_id: template.id,
      template_name: template.name,
      template_source: builtInTemplate ? "built_in" : "custom",
      template_snapshot_json: buildTemplateSnapshot(template),
      field_values_json: fieldValues,
      verification_url: verificationUrl,
      qr_code_data: qrCodeDataUrl,
      status: "active",
      issued_at: issuedAt,
    });

    if (email) {
      certificateEmailQueue.push({
        to: email,
        name: String(registration.full_name || "Participant"),
        verifyUrl: verificationUrl,
        eventName: String(event.name || "your event"),
        certId: certIdDisplay,
      });
    }

    if (registrationId) existingRegistrationIds.add(registrationId);
    if (email) existingEmails.add(email);
    if (fullName) existingNames.add(fullName);
    seqNum += 1;
  }

  if (certificatesToInsert.length === 0) {
    return { error: "All registered users for this event already have certificates." };
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

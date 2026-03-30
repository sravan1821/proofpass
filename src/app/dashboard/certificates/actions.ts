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

type CertificateEmailRow = {
  id: string;
  organizer_id: string;
  event_id?: string | null;
  certificate_id_display?: string | null;
  recipient_name?: string | null;
  recipient_email?: string | null;
  category?: string | null;
  achievement_detail?: string | null;
  organization_name?: string | null;
  verification_url?: string | null;
  issued_at?: string | null;
};

async function sendCertificateDeliveryEmail(params: {
  organizerId: string;
  certificate: CertificateEmailRow;
  eventName?: string | null;
}) {
  const certificateId = String(params.certificate.certificate_id_display || "Certificate");
  const recipientName = String(params.certificate.recipient_name || "Participant");
  const recipientEmail = normalizeEmail(params.certificate.recipient_email);
  const eventName = String(params.eventName || "your event");
  const categoryLabel =
    params.certificate.category === "winner"
      ? "Winner"
      : params.certificate.category === "runner_up"
        ? "Runner-Up"
        : "Participant";
  const verificationUrl =
    params.certificate.verification_url ||
    `${getAppBaseUrl()}/verify/${encodeURIComponent(certificateId)}`;

  if (!recipientEmail) {
    return { sent: false, skipped: true, reason: "missing-email" as const };
  }

  await sendOrganizerEmail({
    organizerId: params.organizerId,
    to: recipientEmail,
    subject: `Your ${categoryLabel} certificate for ${eventName}`,
    text: `Hi ${recipientName}, your certificate has been issued.\nCertificate ID: ${certificateId}\nView and verify it here: ${verificationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 640px; margin: 0 auto;">
        <div style="padding: 24px; border-radius: 18px; border: 1px solid rgba(88,115,255,0.16); background: #f8fbff;">
          <div style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #5873ff; font-weight: 700; margin-bottom: 10px;">ProofPass Certificate Delivery</div>
          <h2 style="margin: 0 0 12px; font-size: 24px; color: #0f172a;">Your certificate is ready</h2>
          <p style="margin: 0 0 12px;">Hi ${recipientName},</p>
          <p style="margin: 0 0 12px;">Your <strong>${categoryLabel}</strong> certificate for <strong>${eventName}</strong> has been issued.</p>
          <div style="padding: 14px 16px; border-radius: 14px; background: #ffffff; border: 1px solid rgba(15,23,42,0.08); margin: 18px 0;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 6px;">Certificate ID</div>
            <div style="font-size: 18px; font-weight: 700; color: #1d4ed8;">${certificateId}</div>
            <div style="font-size: 14px; color: #475569; margin-top: 8px;">Issued by ${String(params.certificate.organization_name || "ProofPass")}</div>
          </div>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 20px; border-radius: 999px; background: #5873ff; color: #ffffff; text-decoration: none; font-weight: 700;">Open Certificate</a>
          <p style="margin: 16px 0 0; font-size: 13px; color: #64748b;">This delivery includes the public verification link so the certificate can be viewed and verified from any device.</p>
        </div>
      </div>
    `,
  });

  return { sent: true, skipped: false };
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
  if (sendEmail && organizerSmtp) {
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

export async function issueCertificatesByCategoryAction(
  eventId: string,
  categoryTemplateMap: { winner: string; runner_up: string; participant: string },
  winnerId: string | null,
  runnerId: string | null,
  sendEmail = false,
) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  // 1. Verify event belongs to user
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("organizer_id", user.id)
    .single();

  if (!event) return { error: "Event not found." };

  // 2. Get all registrations
  const { data: registrationsData } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  const allRegistrations = (registrationsData as Array<Record<string, unknown>> | null) ?? [];
  
  // Only issue certificates to checked-in participants (anti-proxy measure)
  const registrations = allRegistrations.filter((reg) => reg.checked_in === true);
  
  if (allRegistrations.length === 0) {
    return { error: "No registered users were found for this event." };
  }
  
  if (registrations.length === 0) {
    return { error: "No checked-in participants found. Check in participants who actually attended before issuing certificates." };
  }

  // 3. Save participant categories - delete existing and re-create
  await supabase.from("participants").delete().eq("event_id", eventId);

  const participantsToInsert = registrations.map((reg: Record<string, unknown>) => {
    let category = "participant";
    if (String(reg.id) === winnerId) category = "winner";
    else if (String(reg.id) === runnerId) category = "runner_up";

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

  const { error: participantError } = await supabase.from("participants").insert(participantsToInsert);
  if (participantError) return { error: participantError.message };

  // 4. Resolve templates per category
  const resolvedTemplates: Record<string, CertificateTemplate | null> = {};
  for (const [category, templateId] of Object.entries(categoryTemplateMap)) {
    if (!templateId) {
      resolvedTemplates[category] = null;
      continue;
    }
    const builtIn = CERTIFICATE_TEMPLATES.find((item) => item.id === templateId) ?? null;
    if (builtIn) {
      resolvedTemplates[category] = builtIn;
    } else {
      const { data: customRecord } = await supabase
        .from("certificate_templates")
        .select("*")
        .eq("id", templateId)
        .eq("organizer_id", user.id)
        .single();
      resolvedTemplates[category] = customRecord
        ? mapCustomCertificateTemplate(customRecord as Record<string, unknown>)
        : null;
    }
  }

  // Ensure at least the participant template exists
  if (!resolvedTemplates.participant) {
    return { error: "A certificate template for participants is required." };
  }

  // 5. Check for existing certificates to avoid duplicates
  const { data: existingCerts } = await supabase
    .from("certificates")
    .select("registration_id, recipient_email, recipient_name, certificate_id_display")
    .eq("event_id", eventId);

  const existingCertificates = (existingCerts as Array<Record<string, unknown>> | null) ?? [];
  const existingRegistrationIds = new Set(existingCertificates.map((item) => String(item.registration_id || "")).filter(Boolean));
  const existingEmails = new Set(existingCertificates.map((item) => normalizeEmail(item.recipient_email)).filter(Boolean));
  const existingNames = new Set(existingCertificates.map((item) => normalizeName(item.recipient_name)).filter(Boolean));

  let seqNum = existingCertificates.length + 1;
  const year = new Date().getFullYear();
  const eventCode =
    String(event.event_code || "").trim() ||
    String(event.name || "")
      .replace(/[^A-Z]/gi, "")
      .slice(0, 4)
      .toUpperCase() ||
    "EV";

  const certificatesToInsert: Array<Record<string, unknown>> = [];
  const certificateEmailQueue: Array<{ to: string; name: string; verifyUrl: string; eventName: string; certId: string; category: string }> = [];

  // 6. Generate certificates with per-category templates
  for (const registration of registrations) {
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

    // Determine category
    let category = "participant";
    if (registrationId === winnerId) category = "winner";
    else if (registrationId === runnerId) category = "runner_up";

    // Get the right template for this category
    const template = resolvedTemplates[category] ?? resolvedTemplates.participant!;

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

    const achievementDetail =
      category === "winner"
        ? "Winner"
        : category === "runner_up"
          ? "Runner-Up"
          : "Participant";

    const fieldValues = buildCertificateValueMap({
      registration,
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
      category,
      achievement_detail: achievementDetail,
      organization_name: organizationName,
      organization_logo_url: user.orgLogoUrl,
      template_id: template.id,
      template_name: template.name,
      template_source: template.source,
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
        category,
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

  // 7. Insert certificates
  const { error: insertError } = await supabase.from("certificates").insert(certificatesToInsert);
  if (insertError) return { error: insertError.message };

  // 8. Send emails
  const organizerSmtp = await getOrganizerSmtpSettings(user.id);
  if (sendEmail && organizerSmtp) {
    for (const item of certificateEmailQueue) {
      const categoryLabel =
        item.category === "winner"
          ? "🏆 Winner"
          : item.category === "runner_up"
            ? "🥈 Runner-Up"
            : "📜 Participant";

      await sendOrganizerEmail({
        organizerId: user.id,
        to: item.to,
        subject: `Your ${categoryLabel} Certificate for ${item.eventName}`,
        text: `Hi ${item.name}, your ${categoryLabel} certificate for ${item.eventName} has been issued. Verify it here: ${item.verifyUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
            <h2>Your certificate is ready</h2>
            <p>Hi ${item.name},</p>
            <p>Congratulations! You have been awarded a <strong>${categoryLabel}</strong> certificate for <strong>${item.eventName}</strong>.</p>
            <p>Certificate ID: <strong>${item.certId}</strong></p>
            <p><a href="${item.verifyUrl}" style="display:inline-block;padding:12px 24px;background:#5873ff;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">View & Verify Certificate</a></p>
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

export async function sendIssuedCertificatesAction(certificateIds: string[]) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const uniqueCertificateIds = Array.from(new Set(certificateIds.map((id) => String(id).trim()).filter(Boolean)));
  if (uniqueCertificateIds.length === 0) {
    return { error: "Select at least one certificate to send." };
  }

  const organizerSmtp = await getOrganizerSmtpSettings(user.id);
  if (!organizerSmtp) {
    return { error: "Configure SMTP before sending certificate emails.", smtpRequired: true };
  }

  const { data } = await supabase
    .from("certificates")
    .select("id, organizer_id, event_id, certificate_id_display, recipient_name, recipient_email, category, achievement_detail, organization_name, verification_url, issued_at, events(name)")
    .eq("organizer_id", user.id)
    .in("id", uniqueCertificateIds);

  const certificates = (data as Array<CertificateEmailRow & { events?: { name?: string | null } | null }> | null) ?? [];
  if (certificates.length === 0) {
    return { error: "No matching certificates were found." };
  }

  let sentCount = 0;
  let skippedCount = 0;

  for (const certificate of certificates) {
    try {
      const result = await sendCertificateDeliveryEmail({
        organizerId: user.id,
        certificate,
        eventName: certificate.events?.name ?? null,
      });

      if (result.sent) {
        sentCount += 1;
      } else {
        skippedCount += 1;
      }
    } catch {
      skippedCount += 1;
    }
  }

  if (sentCount === 0) {
    return { error: "No certificate emails were sent. Check recipient emails and SMTP settings." };
  }

  return { success: true, sentCount, skippedCount };
}

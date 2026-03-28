"use server";

import { requireApprovedOrganizer } from "@/lib/auth";
import { createMongoServerClient } from "@/lib/db/mongo/server";
import { verifyOrganizerSmtp } from "@/lib/mail/organizer-mail";
import { revalidatePath } from "next/cache";

export async function saveOrganizerSmtpSettingsAction(formData: FormData) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const smtpPassword = String(formData.get("smtpPassword") || "");
  const enabled = formData.get("smtpEnabled") === "on";

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const payload = {
    smtp_enabled: enabled,
    smtp_host: String(formData.get("smtpHost") || ""),
    smtp_port: Number(formData.get("smtpPort") || 587),
    smtp_secure: formData.get("smtpSecure") === "on",
    smtp_username: String(formData.get("smtpUsername") || ""),
    smtp_password: smtpPassword || existing?.smtp_password || "",
    smtp_from_name: String(formData.get("smtpFromName") || ""),
    smtp_from_email: String(formData.get("smtpFromEmail") || ""),
    smtp_reply_to: String(formData.get("smtpReplyTo") || ""),
    smtp_send_registration_emails: formData.get("smtpSendRegistrationEmails") === "on",
    smtp_send_certificate_emails: formData.get("smtpSendCertificateEmails") === "on",
  };

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function testOrganizerSmtpSettingsAction() {
  const user = await requireApprovedOrganizer();

  try {
    await verifyOrganizerSmtp(user.id);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "SMTP test failed." };
  }
}

import nodemailer from "nodemailer";
import { createMongoServerClient } from "@/lib/db/mongo/server";
import { getAppUrl } from "@/lib/env";

export interface OrganizerSmtpSettings {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  sendRegistrationEmails?: boolean;
  sendCertificateEmails?: boolean;
}

export async function getOrganizerSmtpSettings(organizerId: string): Promise<OrganizerSmtpSettings | null> {
  const supabase = await createMongoServerClient();
  if (!supabase) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", organizerId)
    .single();

  if (!profile?.smtp_enabled || !profile.smtp_host || !profile.smtp_username || !profile.smtp_password || !profile.smtp_from_email) {
    return null;
  }

  return {
    enabled: true,
    host: String(profile.smtp_host),
    port: Number(profile.smtp_port || 587),
    secure: Boolean(profile.smtp_secure),
    username: String(profile.smtp_username),
    password: String(profile.smtp_password),
    fromName: String(profile.smtp_from_name || profile.org_name || "ProofPass"),
    fromEmail: String(profile.smtp_from_email),
    replyTo: profile.smtp_reply_to ? String(profile.smtp_reply_to) : undefined,
    sendRegistrationEmails: Boolean(profile.smtp_send_registration_emails),
    sendCertificateEmails: Boolean(profile.smtp_send_certificate_emails),
  };
}

function createTransport(settings: OrganizerSmtpSettings) {
  return nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: {
      user: settings.username,
      pass: settings.password,
    },
  });
}

export async function verifyOrganizerSmtp(organizerId: string) {
  const settings = await getOrganizerSmtpSettings(organizerId);
  if (!settings) {
    return { error: "SMTP configuration is incomplete." };
  }

  const transport = createTransport(settings);
  await transport.verify();
  return { success: true };
}

export async function sendOrganizerEmail(params: {
  organizerId: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}) {
  const settings = await getOrganizerSmtpSettings(params.organizerId);
  if (!settings) {
    return { skipped: true, error: "SMTP configuration is incomplete." };
  }

  const transport = createTransport(settings);
  await transport.sendMail({
    from: `"${settings.fromName}" <${settings.fromEmail}>`,
    to: params.to,
    replyTo: settings.replyTo,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });

  return { success: true };
}

export function getAppBaseUrl() {
  return getAppUrl();
}

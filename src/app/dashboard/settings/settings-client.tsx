"use client";

import { useState } from "react";
import { Mail, Send, ShieldCheck } from "lucide-react";
import { saveOrganizerSmtpSettingsAction, testOrganizerSmtpSettingsAction } from "./actions";

export function SettingsClient({ profile }: { profile: Record<string, unknown> | null }) {
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const result = await saveOrganizerSmtpSettingsAction(new FormData(event.currentTarget));
    setSaving(false);
    setMessage(result?.error || "SMTP settings saved.");
  }

  async function handleTest() {
    setTesting(true);
    setMessage("");
    const result = await testOrganizerSmtpSettingsAction();
    setTesting(false);
    setMessage(result?.error || "SMTP connection verified.");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "920px" }}>
      <div>
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p style={{ color: "var(--muted-foreground)" }}>Manage your organization profile, branding, and outbound mail delivery.</p>
      </div>

      <div className="glass-card" style={{ padding: "24px" }}>
        <h2 className="font-bold mb-4">Organization Profile</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Organization Name</p>
            <p className="font-semibold">{String(profile?.org_name || "—")}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Type</p>
            <p>{String(profile?.org_type || "—")}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Website</p>
            <p>{String(profile?.org_website || "—")}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Location</p>
            <p>{[profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ") || "—"}</p>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: "24px" }}>
        <div className="inline-flex items-center gap-2" style={{ marginBottom: "10px", color: "var(--primary-soft)" }}>
          <Mail size={18} />
          <h2 className="font-bold" style={{ margin: 0 }}>Organizer SMTP</h2>
        </div>
        <p style={{ color: "var(--muted-foreground)", marginBottom: "20px", lineHeight: 1.6 }}>
          Configure your own SMTP mailbox so registration confirmations, certificate delivery, and event updates go out from your organization.
        </p>

        <form onSubmit={handleSave}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
              <input type="checkbox" name="smtpEnabled" defaultChecked={Boolean(profile?.smtp_enabled)} />
              Enable SMTP delivery
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
              <input type="checkbox" name="smtpSecure" defaultChecked={Boolean(profile?.smtp_secure)} />
              Use secure connection
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>SMTP Host</label>
              <input name="smtpHost" className="input-field" defaultValue={String(profile?.smtp_host || "")} placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Port</label>
              <input name="smtpPort" type="number" className="input-field" defaultValue={Number(profile?.smtp_port || 587)} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>SMTP Username</label>
              <input name="smtpUsername" className="input-field" defaultValue={String(profile?.smtp_username || "")} placeholder="mailer@yourorg.com" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>SMTP Password</label>
              <input name="smtpPassword" type="password" className="input-field" placeholder={profile?.smtp_password ? "Saved password" : "App password or mailbox password"} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>From Name</label>
              <input name="smtpFromName" className="input-field" defaultValue={String(profile?.smtp_from_name || profile?.org_name || "")} placeholder="ProofPass Labs" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>From Email</label>
              <input name="smtpFromEmail" type="email" className="input-field" defaultValue={String(profile?.smtp_from_email || "")} placeholder="events@yourorg.com" />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Reply-To Email</label>
            <input name="smtpReplyTo" type="email" className="input-field" defaultValue={String(profile?.smtp_reply_to || "")} placeholder="team@yourorg.com" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
              <input type="checkbox" name="smtpSendRegistrationEmails" defaultChecked={Boolean(profile?.smtp_send_registration_emails)} />
              Auto-send registration confirmations
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
              <input type="checkbox" name="smtpSendCertificateEmails" defaultChecked={Boolean(profile?.smtp_send_certificate_emails)} />
              Auto-send certificate delivery mails
            </label>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              <ShieldCheck size={16} />
              {saving ? "Saving..." : "Save SMTP Settings"}
            </button>
            <button type="button" onClick={handleTest} className="btn-secondary" disabled={testing}>
              <Send size={16} />
              {testing ? "Testing..." : "Test Connection"}
            </button>
          </div>

          {message ? (
            <div style={{ marginTop: "14px", padding: "12px 14px", borderRadius: "12px", background: message.toLowerCase().includes("error") || message.toLowerCase().includes("failed") || message.toLowerCase().includes("incomplete") ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", color: message.toLowerCase().includes("error") || message.toLowerCase().includes("failed") || message.toLowerCase().includes("incomplete") ? "var(--danger)" : "var(--success)", fontSize: "0.875rem" }}>
              {message}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}

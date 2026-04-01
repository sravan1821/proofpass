"use client";

import { useState } from "react";
import { ExternalLink, Mail, Send, Users, Trophy, Award, UserCheck, Eye, Copy } from "lucide-react";
import {
  addParticipantAction,
  deleteParticipantAction,
  sendEventUpdateEmailAction,
  updateEventStatusAction,
  updateParticipantCategoryAction,
  saveOverviewParticipantsAction,
} from "../actions";
import Link from "next/link";
import ShareButton from "@/components/share-button";
import { buildPublicUrl } from "@/lib/public-url";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface EventDetailClientProps {
  event: Record<string, unknown>;
  participants: Array<Record<string, unknown>>;
  registrations: Array<Record<string, unknown>>;
}

type TabKey = "overview" | "registrations" | "email" | "participants";

export function EventDetailClient({ event, participants, registrations }: EventDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [mailSubject, setMailSubject] = useState(`${String(event.name)} update`);
  const [mailMessage, setMailMessage] = useState("");
  const [mailAudience, setMailAudience] = useState("all");
  const [shareMsg, setShareMsg] = useState("");

  // Overview state — winner / runner selection
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [runnerId, setRunnerId] = useState<string | null>(null);
  const [savingOverview, setSavingOverview] = useState(false);

  async function handleStatusChange(status: string) {
    setLoading(true);
    const result = await updateEventStatusAction(event.id as string, status);
    if (result?.error) setMsg(result.error);
    setLoading(false);
  }

  async function handleAddParticipant(eventForm: React.FormEvent<HTMLFormElement>) {
    eventForm.preventDefault();
    setLoading(true);
    const formData = new FormData(eventForm.currentTarget);
    formData.set("eventId", event.id as string);
    const result = await addParticipantAction(formData);
    if (result?.error) setMsg(result.error);
    else setShowAddParticipant(false);
    setLoading(false);
  }

  async function handleCategoryChange(participantId: string, category: string) {
    await updateParticipantCategoryAction(participantId, category, event.id as string);
  }

  async function handleDelete(participantId: string) {
    if (confirm("Remove this participant?")) {
      await deleteParticipantAction(participantId, event.id as string);
    }
  }

  async function handleSendUpdate() {
    setLoading(true);
    const result = await sendEventUpdateEmailAction(event.id as string, mailSubject, mailMessage, mailAudience);
    if (result?.error) setMsg(result.error);
    else setMsg(`Sent update to ${result.count} registrant(s).`);
    setLoading(false);
  }

  async function handleSaveOverview() {
    setSavingOverview(true);
    setMsg("");
    const result = await saveOverviewParticipantsAction(event.id as string, winnerId, runnerId);
    if (result?.error) setMsg(result.error);
    else setMsg(`Saved ${result.count} participant(s) with categories successfully!`);
    setSavingOverview(false);
  }

  function handleWinnerSelect(regId: string) {
    if (runnerId === regId) setRunnerId(null);
    setWinnerId(winnerId === regId ? null : regId);
  }

  function handleRunnerSelect(regId: string) {
    if (winnerId === regId) setWinnerId(null);
    setRunnerId(runnerId === regId ? null : regId);
  }

  const statusFlow: Record<string, { label: string; next: string }[]> = {
    draft: [{ label: "Publish", next: "published" }],
    published: [{ label: "Mark Active", next: "active" }],
    active: [{ label: "Mark Completed", next: "completed" }],
    completed: [{ label: "Archive", next: "archived" }],
    archived: [],
  };

  const categoryColors: Record<string, string> = {
    winner: "badge-gold",
    runner_up: "badge-silver",
    participant: "badge-info",
  };

  const paidCount = registrations.filter((r) => r.payment_status === "paid").length;
  const pendingCount = registrations.filter((r) => r.payment_status !== "paid").length;

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <Eye size={16} /> },
    { key: "registrations", label: `Registrations (${registrations.length})`, icon: <Users size={16} /> },
    { key: "email", label: "Email Updates", icon: <Mail size={16} /> },
    { key: "participants", label: `Participants (${participants.length})`, icon: <UserCheck size={16} /> },
  ];
  const eventPath = `/events/${String(event.slug)}/register`;
  const eventPageUrl =
    typeof window !== "undefined"
      ? buildPublicUrl(eventPath, window.location.origin)
      : buildPublicUrl(eventPath);

  async function handleCopyEventLink() {
    try {
      await navigator.clipboard.writeText(eventPageUrl);
      setShareMsg("Event link copied.");
      setTimeout(() => setShareMsg(""), 2500);
    } catch {
      setShareMsg("Could not copy the event link.");
      setTimeout(() => setShareMsg(""), 2500);
    }
  }

  return (
    <div>
      {msg || shareMsg ? (
        <div style={{ background: (msg || shareMsg).toLowerCase().includes("success") || (msg || shareMsg).toLowerCase().includes("sent") || (msg || shareMsg).toLowerCase().includes("saved") || (msg || shareMsg).toLowerCase().includes("copied") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${(msg || shareMsg).toLowerCase().includes("success") || (msg || shareMsg).toLowerCase().includes("sent") || (msg || shareMsg).toLowerCase().includes("saved") || (msg || shareMsg).toLowerCase().includes("copied") ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: "10px", padding: "12px", marginBottom: "16px", color: (msg || shareMsg).toLowerCase().includes("success") || (msg || shareMsg).toLowerCase().includes("sent") || (msg || shareMsg).toLowerCase().includes("saved") || (msg || shareMsg).toLowerCase().includes("copied") ? "var(--success)" : "var(--danger)", fontSize: "0.875rem" }}>
          {msg || shareMsg}
        </div>
      ) : null}

      {/* ── Event Info ── */}
      <div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <h1 className="text-2xl font-bold mb-1">{event.name as string}</h1>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>{event.description as string}</p>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.78rem", marginTop: "10px", wordBreak: "break-all" }}>
              Share link: <a href={eventPageUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary-soft)" }}>{eventPageUrl}</a>
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <a
              href={eventPageUrl}
              target="_blank"
              rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "8px", background: "rgba(88,115,255,0.1)", border: "1px solid rgba(88,115,255,0.2)", fontSize: "0.8rem", color: "var(--primary-soft)", fontWeight: 500 }}
            >
              <ExternalLink size={14} />
              Event Page
            </a>
            <button
              type="button"
              onClick={handleCopyEventLink}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: "0.8rem", color: "var(--foreground)", fontWeight: 500, cursor: "pointer" }}
            >
              <Copy size={14} />
              Copy Link
            </button>
            <ShareButton
              eventName={String(event.name)}
              eventDescription={(event.description as string) || undefined}
              eventSlug={String(event.slug)}
              eventDate={event.start_date ? new Date(event.start_date as string).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : undefined}
              eventVenue={(event.venue_details as string) || (event.venue as string) || undefined}
              eventFee={event.registration_fee as string | number | null | undefined}
              variant="full"
            />
            <span className={`badge ${event.status === "completed" ? "badge-success" : event.status === "draft" ? "badge-neutral" : "badge-info"}`}>
              {event.status as string}
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" }}>
          {[
            { label: "Start Date", value: event.start_date ? new Date(event.start_date as string).toLocaleDateString() : "—" },
            { label: "End Date", value: event.end_date ? new Date(event.end_date as string).toLocaleDateString() : "—" },
            { label: "Category", value: (event.category as string) || "—" },
            { label: "Mode", value: (event.event_mode as string)?.replace("_", " ") || "—" },
          ].map((item) => (
            <div key={item.label}>
              <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
              <p style={{ fontWeight: 500, marginTop: "4px", textTransform: "capitalize" }}>{item.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {(statusFlow[(event.status as string)] || []).map((action) => (
            <button key={action.next} onClick={() => handleStatusChange(action.next)} className="btn-primary" disabled={loading} style={{ padding: "8px 20px", fontSize: "0.875rem" }}>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "rgba(255,255,255,0.02)", borderRadius: "14px", padding: "4px", border: "1px solid rgba(255,255,255,0.06)" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.88rem",
              fontWeight: activeTab === tab.key ? 600 : 500,
              color: activeTab === tab.key ? "var(--foreground)" : "var(--muted-foreground)",
              background: activeTab === tab.key ? "rgba(88,115,255,0.12)" : "transparent",
              transition: "all 0.2s ease",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════ OVERVIEW TAB ══════════════════ */}
      {activeTab === "overview" && (
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 className="text-lg font-bold inline-flex items-center gap-2" style={{ marginBottom: "4px" }}>
                <Trophy size={20} style={{ color: "#f59e0b" }} />
                Participant Overview
              </h2>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.85rem", margin: 0 }}>
                Select exactly one Winner and one Runner-Up. All others will be categorized as Participants.
              </p>
            </div>
            <button
              onClick={handleSaveOverview}
              className="btn-primary"
              disabled={savingOverview || registrations.length === 0}
              style={{ padding: "10px 24px", fontSize: "0.9rem" }}
            >
              {savingOverview ? "Saving..." : "Accept & Save"}
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
            <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(88,115,255,0.06)", border: "1px solid rgba(88,115,255,0.12)", textAlign: "center" }}>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#5873ff" }}>{registrations.length}</p>
              <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginTop: "4px" }}>Total</p>
            </div>
            <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)", textAlign: "center" }}>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#f59e0b" }}>{winnerId ? 1 : 0}</p>
              <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginTop: "4px" }}>Winner</p>
            </div>
            <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(156,163,175,0.06)", border: "1px solid rgba(156,163,175,0.12)", textAlign: "center" }}>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#9ca3af" }}>{runnerId ? 1 : 0}</p>
              <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginTop: "4px" }}>Runner-Up</p>
            </div>
            <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(79,70,229,0.06)", border: "1px solid rgba(79,70,229,0.12)", textAlign: "center" }}>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#4f46e5" }}>{Math.max(0, registrations.length - (winnerId ? 1 : 0) - (runnerId ? 1 : 0))}</p>
              <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginTop: "4px" }}>Participants</p>
            </div>
          </div>

          {registrations.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
              <Users size={36} style={{ margin: "0 auto 12px", color: "var(--primary-soft)" }} />
              <p style={{ color: "var(--muted-foreground)", marginBottom: "8px" }}>No registrations yet</p>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.82rem" }}>
                Share your event page to start receiving registrations, then assign winners here.
              </p>
            </div>
          ) : (
            <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <table className="schedule-table" style={{ width: "100%" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>#</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Name</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "0.75rem", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                      <span className="inline-flex items-center gap-1 justify-center"><Trophy size={14} /> Winner</span>
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "0.75rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                      <span className="inline-flex items-center gap-1 justify-center"><Award size={14} /> Runner</span>
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "0.75rem", color: "#4f46e5", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                      <span className="inline-flex items-center gap-1 justify-center"><UserCheck size={14} /> Participant</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg: any, index: number) => {
                    const isWinner = winnerId === reg.id;
                    const isRunner = runnerId === reg.id;
                    const isParticipant = !isWinner && !isRunner;
                    return (
                      <tr
                        key={reg.id}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          background: isWinner
                            ? "rgba(245,158,11,0.04)"
                            : isRunner
                            ? "rgba(156,163,175,0.04)"
                            : "transparent",
                          transition: "background 0.2s ease",
                        }}
                      >
                        <td style={{ padding: "14px 16px", color: "var(--muted-foreground)", fontSize: "0.8rem" }}>{index + 1}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontWeight: 600 }}>{reg.full_name}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{reg.email || "—"}</div>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          <label style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                            <input
                              type="radio"
                              name="winner"
                              checked={isWinner}
                              onChange={() => handleWinnerSelect(reg.id)}
                              style={{
                                width: "20px",
                                height: "20px",
                                accentColor: "#f59e0b",
                                cursor: "pointer",
                              }}
                            />
                          </label>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          <label style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                            <input
                              type="radio"
                              name="runner"
                              checked={isRunner}
                              onChange={() => handleRunnerSelect(reg.id)}
                              style={{
                                width: "20px",
                                height: "20px",
                                accentColor: "#9ca3af",
                                cursor: "pointer",
                              }}
                            />
                          </label>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          {isParticipant ? (
                            <span style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              background: "rgba(79,70,229,0.15)",
                              color: "#7c6eff",
                            }}>
                              ✓
                            </span>
                          ) : (
                            <span style={{ color: "var(--muted-foreground)", fontSize: "0.8rem" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Legend */}
          <div style={{ display: "flex", gap: "20px", marginTop: "16px", justifyContent: "center" }}>
            {[
              { color: "#f59e0b", label: "Winner (1 only)" },
              { color: "#9ca3af", label: "Runner-Up (1 only)" },
              { color: "#4f46e5", label: "Participant (auto)" },
            ].map((item) => (
              <div key={item.label} className="inline-flex items-center gap-2" style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.color }} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════ REGISTRATIONS TAB ══════════════════ */}
      {activeTab === "registrations" && (
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div className="inline-flex items-center gap-2" style={{ color: "var(--primary-soft)" }}>
              <Users size={20} />
              <h2 className="text-lg font-bold" style={{ margin: 0 }}>Registrations ({registrations.length})</h2>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <span className="badge badge-success">{paidCount} paid</span>
              <span className="badge badge-warning">{pendingCount} pending</span>
            </div>
          </div>

          {/* Registration Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "20px" }}>
            <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(88,115,255,0.06)", border: "1px solid rgba(88,115,255,0.12)", textAlign: "center" }}>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#5873ff" }}>{registrations.length}</p>
              <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginTop: "4px" }}>Total Registered</p>
            </div>
            <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)", textAlign: "center" }}>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#10b981" }}>{paidCount}</p>
              <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginTop: "4px" }}>Payment Confirmed</p>
            </div>
            <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)", textAlign: "center" }}>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#f59e0b" }}>{pendingCount}</p>
              <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginTop: "4px" }}>Payment Pending</p>
            </div>
          </div>

          {/* Registrations Table */}
          {registrations.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
              <Users size={36} style={{ margin: "0 auto 12px", color: "var(--primary-soft)" }} />
              <p style={{ color: "var(--muted-foreground)", marginBottom: "8px" }}>No registrations yet</p>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.82rem" }}>
                Share <Link href={`/events/${event.slug}/register`} style={{ color: "var(--primary-soft)", textDecoration: "underline" }}> your event page</Link> to start receiving registrations.
              </p>
            </div>
          ) : (
            <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <table className="schedule-table">
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>College/Org</th>
                    <th>Payment</th>
                    <th>Receipt No.</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg: any, index: number) => (
                    <tr key={reg.id}>
                      <td style={{ color: "var(--muted-foreground)", fontSize: "0.8rem" }}>{index + 1}</td>
                      <td style={{ fontWeight: 600 }}>{reg.full_name}</td>
                      <td style={{ color: "var(--muted-foreground)" }}>
                        <a href={`mailto:${reg.email}`} style={{ color: "var(--primary-soft)" }}>{reg.email}</a>
                      </td>
                      <td style={{ color: "var(--muted-foreground)" }}>{reg.phone || "—"}</td>
                      <td style={{ color: "var(--muted-foreground)", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{reg.college_name || "—"}</td>
                      <td>
                        <span className={`badge ${reg.payment_status === "paid" ? "badge-success" : "badge-warning"}`}>
                          {reg.payment_status}
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
                        {reg.receipt_number || "—"}
                      </td>
                      <td style={{ color: "var(--muted-foreground)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {reg.created_at ? new Date(reg.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════ EMAIL TAB ══════════════════ */}
      {activeTab === "email" && (
        <div className="glass-card" style={{ padding: "24px" }}>
          <div className="inline-flex items-center gap-2" style={{ marginBottom: "14px", color: "var(--primary-soft)" }}>
            <Mail size={18} />
            <h2 className="text-lg font-bold" style={{ margin: 0 }}>Registrant Updates</h2>
          </div>
          <p style={{ color: "var(--muted-foreground)", marginBottom: "16px" }}>
            Send schedule changes, venue notes, and event updates through your configured SMTP inbox.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "12px", marginBottom: "12px" }}>
            <select value={mailAudience} onChange={(eventSelect) => setMailAudience(eventSelect.target.value)} className="input-field">
              <option value="all">All Registrants</option>
              <option value="paid">Paid Registrants</option>
              <option value="pending">Pending Payment</option>
            </select>
            <input value={mailSubject} onChange={(eventInput) => setMailSubject(eventInput.target.value)} className="input-field" placeholder="Email subject" />
          </div>
          <textarea value={mailMessage} onChange={(eventInput) => setMailMessage(eventInput.target.value)} className="input-field" rows={5} placeholder="Write the update you want to send to attendees..." style={{ resize: "vertical", marginBottom: "12px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "var(--muted-foreground)", fontSize: "0.84rem" }}>
              {registrations.filter((registration) => registration.email).length} registrant(s) currently have email addresses on file.
            </span>
            <button onClick={handleSendUpdate} className="btn-primary" disabled={loading || !mailSubject.trim() || !mailMessage.trim()}>
              <Send size={16} />
              {loading ? "Sending..." : "Send Update"}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════ PARTICIPANTS TAB ══════════════════ */}
      {activeTab === "participants" && (
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 className="text-lg font-bold">Participants ({participants.length})</h2>
            <button onClick={() => setShowAddParticipant(true)} className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
              + Add Participant
            </button>
          </div>

          {showAddParticipant ? (
            <form onSubmit={handleAddParticipant} style={{ background: "rgba(79,70,229,0.05)", borderRadius: "10px", padding: "20px", marginBottom: "16px", border: "1px solid rgba(79,70,229,0.1)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 2fr", gap: "12px", marginBottom: "12px" }}>
                <input type="text" name="fullName" required className="input-field" placeholder="Full Name" />
                <input type="email" name="email" className="input-field" placeholder="Email" />
                <select name="category" className="input-field">
                  <option value="participant">Participant</option>
                  <option value="winner">Winner</option>
                  <option value="runner_up">Runner-Up</option>
                </select>
                <input type="text" name="achievementDetail" className="input-field" placeholder="Achievement detail" />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "8px 16px", fontSize: "0.85rem" }}>Add</button>
                <button type="button" onClick={() => setShowAddParticipant(false)} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>Cancel</button>
              </div>
            </form>
          ) : null}

          {participants.length === 0 ? (
            <p style={{ color: "var(--muted-foreground)", textAlign: "center", padding: "32px 0" }}>No participants yet. Use the Overview tab to assign winners, or add participants manually.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Name", "Email", "Category", "Achievement", "Actions"].map((heading) => (
                    <th key={heading} style={{ padding: "10px 12px", textAlign: "left", fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr key={participant.id as string} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "12px", fontWeight: 500 }}>{participant.full_name as string}</td>
                    <td style={{ padding: "12px", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>{(participant.email as string) || "—"}</td>
                    <td style={{ padding: "12px" }}>
                      <select value={participant.category as string} onChange={(eventSelect) => handleCategoryChange(participant.id as string, eventSelect.target.value)} style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer" }} className={`badge ${categoryColors[participant.category as string] || "badge-info"}`}>
                        <option value="participant">Participant</option>
                        <option value="winner">Winner</option>
                        <option value="runner_up">Runner-Up</option>
                      </select>
                    </td>
                    <td style={{ padding: "12px", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>{(participant.achievement_detail as string) || "—"}</td>
                    <td style={{ padding: "12px" }}>
                      <button onClick={() => handleDelete(participant.id as string)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.8rem" }}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Building2, CalendarDays, CheckCircle2, Clock3, FilePenLine, IndianRupee, MapPin, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { registerForEventAction } from "../../actions";
import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface RegisterFormProps {
  event: any;
  organizer: any;
  isCompleted?: boolean;
}

interface TeamMember {
  name: string;
  email: string;
}

export default function RegisterForm({ event, organizer, isCompleted = false }: RegisterFormProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [teamSize, setTeamSize] = useState(1);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { name: "", email: "" },
    { name: "", email: "" },
  ]);
  const router = useRouter();

  const advantages = (event.advantages as string[]) || [];

  function updateTeamMember(index: number, field: keyof TeamMember, value: string) {
    setTeamMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate team members if team size > 1
    if (teamSize > 1) {
      for (let i = 0; i < teamSize - 1; i++) {
        if (!teamMembers[i].name.trim() || !teamMembers[i].email.trim()) {
          setError(`Please fill in name and email for Team Member ${i + 2}.`);
          setLoading(false);
          return;
        }
        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teamMembers[i].email.trim())) {
          setError(`Invalid email address for Team Member ${i + 2}.`);
          setLoading(false);
          return;
        }
      }
    }

    const formData = new FormData(e.currentTarget);
    formData.set("eventId", event.id as string);
    formData.set("teamSize", String(teamSize));

    // Attach team member details as JSON
    if (teamSize > 1) {
      const members = teamMembers.slice(0, teamSize - 1).map((m) => ({
        name: m.name.trim(),
        email: m.email.trim(),
      }));
      formData.set("teamMembers", JSON.stringify(members));
    }

    const result = await registerForEventAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.registrationId) {
      if (event.registration_fee && Number(event.registration_fee) > 0) {
        router.push(`/events/${event.slug}/payment?rid=${result.registrationId}`);
      } else {
        router.push(`/events/${event.slug}/receipt/${result.registrationId}`);
      }
    }
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(99,102,241,0.08)", background: "rgba(7,11,23,0.8)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" className="flex items-center gap-3">
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700 }}>P</div>
            <span className="font-bold text-lg">ProofPass</span>
          </Link>
          <Link href="/events" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
            <ArrowLeft size={16} />
            All Events
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: "900px", margin: "0 auto", paddingTop: "100px", padding: "100px 24px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
          {/* Event Info */}
          <div>
            <div className="glass-card" style={{ padding: "28px", marginBottom: "20px" }}>
              <span className="badge badge-info" style={{ textTransform: "capitalize", marginBottom: "12px", display: "inline-flex" }}>{(event.category as string) || "event"}</span>
              <h1 className="text-2xl font-bold" style={{ marginBottom: "8px" }}>{event.name as string}</h1>
              <p style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", lineHeight: 1.7, marginBottom: "20px" }}>{event.description as string}</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                {[
                  { icon: <CalendarDays size={16} />, text: `${event.start_date ? new Date(event.start_date as string).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "TBA"}${event.end_date && event.end_date !== event.start_date ? ` – ${new Date(event.end_date as string).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}` : ""}` },
                  ...(event.event_time ? [{ icon: <Clock3 size={16} />, text: event.event_time as string }] : []),
                  { icon: <MapPin size={16} />, text: (event.venue_details as string) || (event.venue as string) || "Online" },
                  ...(organizer ? [{ icon: <Building2 size={16} />, text: (event.org_name_display as string) || (organizer.org_name as string) || (organizer.full_name as string) }] : []),
                  { icon: <IndianRupee size={16} />, text: event.registration_fee && Number(event.registration_fee) > 0 ? `₹${event.registration_fee}` : "Free" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem", color: "var(--foreground)" }}>
                    <span style={{ color: "var(--primary-soft)" }}>{item.icon}</span><span>{item.text}</span>
                  </div>
                ))}
              </div>

              {advantages.length > 0 && (
                <div>
                  <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px", fontWeight: 600 }}>Why Attend?</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {advantages.map((a, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
                        <CheckCircle2 size={16} style={{ color: "var(--success)" }} />
                        <span style={{ color: "var(--foreground)" }}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Registration Form */}
          <div>
            <div className="glass-card" style={{ padding: "28px" }}>
              <h2 className="text-lg font-bold inline-flex items-center gap-2" style={{ marginBottom: "20px" }}>
                <FilePenLine size={20} />
                {isCompleted ? "Event Completed" : "Register for this Event"}
              </h2>

              {isCompleted ? (
                <div style={{
                  textAlign: "center", padding: "40px 20px",
                }}>
                  <div style={{
                    width: "64px", height: "64px", borderRadius: "50%",
                    background: "rgba(107,114,128,0.1)", border: "1px solid rgba(107,114,128,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px", fontSize: "1.5rem",
                  }}>✓</div>
                  <h3 className="font-bold" style={{ fontSize: "1.1rem", marginBottom: "8px" }}>Registration Closed</h3>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "20px" }}>
                    This event has already ended. Registrations are no longer accepted.
                  </p>
                  <Link href="/events" className="btn-secondary" style={{ padding: "10px 24px", fontSize: "0.9rem" }}>
                    Browse Upcoming Events →
                  </Link>
                </div>
              ) : (
                <>
              {error && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", color: "var(--danger)", fontSize: "0.875rem" }}>{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Team Leader Section Header */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  marginBottom: "14px", paddingBottom: "8px",
                  borderBottom: "1px solid rgba(99,102,241,0.1)",
                }}>
                  <Users size={15} style={{ color: "var(--primary-soft)" }} />
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--primary-soft)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {teamSize > 1 ? "Team Leader" : "Your Details"}
                  </span>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Full Name *</label>
                  <input type="text" name="fullName" required className="input-field" placeholder="Enter your full name" />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Email Address *</label>
                  <input type="email" name="email" required className="input-field" placeholder="you@example.com" />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Phone Number</label>
                  <input type="tel" name="phone" className="input-field" placeholder="+91 XXXXX XXXXX" />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>College / Organization</label>
                  <input type="text" name="collegeName" className="input-field" placeholder="Your college or organization name" />
                </div>

                {/* Team Size Selector */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Team Size *</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[1, 2, 3].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setTeamSize(size)}
                        style={{
                          flex: 1,
                          padding: "12px 8px",
                          borderRadius: "12px",
                          border: teamSize === size
                            ? "1.5px solid rgba(99,102,241,0.5)"
                            : "1px solid rgba(255,255,255,0.08)",
                          background: teamSize === size
                            ? "rgba(99,102,241,0.12)"
                            : "rgba(255,255,255,0.03)",
                          color: teamSize === size ? "var(--foreground)" : "var(--muted-foreground)",
                          cursor: "pointer",
                          fontWeight: teamSize === size ? 700 : 500,
                          fontSize: "0.9rem",
                          transition: "all 0.2s ease",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span style={{ fontSize: "1.1rem" }}>{size === 1 ? "👤" : size === 2 ? "👥" : "👥+"}</span>
                        <span>{size} {size === 1 ? "Solo" : `Members`}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Team Member Fields */}
                {teamSize > 1 && (
                  <div style={{
                    overflow: "hidden",
                    animation: "slideDown 0.3s ease-out",
                  }}>
                    {Array.from({ length: teamSize - 1 }, (_, i) => (
                      <div
                        key={i}
                        style={{
                          marginBottom: "16px",
                          padding: "16px",
                          borderRadius: "14px",
                          border: "1px solid rgba(99,102,241,0.1)",
                          background: "rgba(99,102,241,0.03)",
                        }}
                      >
                        <div style={{
                          display: "flex", alignItems: "center", gap: "8px",
                          marginBottom: "12px",
                        }}>
                          <UserPlus size={14} style={{ color: "var(--primary-soft)" }} />
                          <span style={{
                            fontSize: "0.78rem", fontWeight: 600,
                            color: "var(--primary-soft)",
                            textTransform: "uppercase", letterSpacing: "0.06em",
                          }}>
                            Team Member {i + 2}
                          </span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div>
                            <label style={{ display: "block", marginBottom: "5px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>
                              Name *
                            </label>
                            <input
                              type="text"
                              className="input-field"
                              placeholder={`Member ${i + 2} name`}
                              value={teamMembers[i].name}
                              onChange={(e) => updateTeamMember(i, "name", e.target.value)}
                              required
                              style={{ fontSize: "0.88rem" }}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", marginBottom: "5px", fontSize: "0.82rem", fontWeight: 500, color: "var(--muted-foreground)" }}>
                              Email *
                            </label>
                            <input
                              type="email"
                              className="input-field"
                              placeholder={`member${i + 2}@email.com`}
                              value={teamMembers[i].email}
                              onChange={(e) => updateTeamMember(i, "email", e.target.value)}
                              required
                              style={{ fontSize: "0.88rem" }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {event.registration_fee && Number(event.registration_fee) > 0 && (
                  <div style={{ padding: "14px", borderRadius: "10px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="inline-flex items-center gap-2" style={{ fontSize: "0.875rem", color: "var(--warning)" }}>
                      <AlertTriangle size={16} />
                      Registration Fee
                    </span>
                    <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--foreground)" }}>₹{event.registration_fee as number}</span>
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", padding: "14px" }}>
                  <span className="inline-flex items-center gap-2">
                    {loading ? "Registering..." : event.registration_fee && Number(event.registration_fee) > 0 ? "Register & Proceed to Payment" : "Register Now"}
                    {!loading && <ArrowRight size={16} />}
                  </span>
                </button>
              </form>
              </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Animation keyframe */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            max-height: 500px;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

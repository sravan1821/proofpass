"use client";

import { useState } from "react";
import Link from "next/link";
import DemoRegistrationModal from "@/components/demo-registration-modal";
import ShareButton from "@/components/share-button";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
} from "lucide-react";

interface SampleEvent {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  startDate: string;
  time: string;
  venue: string;
  fee: number;
  org: string;
  advantages: string[];
  gradient: string;
  catColor: string;
  isOngoing?: boolean;
}

export function LandingEventCard({ event, isDemo = true }: { event: SampleEvent; isDemo?: boolean }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="event-card" style={{ cursor: isDemo ? "default" : "pointer" }}>
        {/* Gradient top bar */}
        <div style={{ height: "5px", background: event.gradient }} />
        <div style={{ padding: "22px 24px" }}>
          {/* Category + Price */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
            <span
              style={{
                padding: "4px 14px",
                borderRadius: "20px",
                background: `${event.catColor}18`,
                border: `1px solid ${event.catColor}35`,
                fontSize: "0.72rem",
                fontWeight: 600,
                color: event.catColor,
                textTransform: "capitalize",
              }}
            >
              {event.category}
            </span>
            <span
              style={{
                fontSize: "0.92rem",
                color: event.fee > 0 ? "var(--foreground)" : "#10b981",
                fontWeight: 700,
              }}
            >
              {event.fee > 0 ? `₹${event.fee}` : "FREE"}
            </span>
          </div>

          {/* Title */}
          <h3 style={{ fontSize: "1.12rem", fontWeight: 700, marginBottom: "8px", color: "white" }}>
            {event.name}
          </h3>

          {/* Description */}
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--muted-foreground)",
              marginBottom: "14px",
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as const,
              overflow: "hidden",
            }}
          >
            {event.description}
          </p>

          {/* Event details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
              <CalendarDays size={13} style={{ color: event.catColor, flexShrink: 0 }} />
              <span>{event.startDate}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
              <Clock size={13} style={{ color: event.catColor, flexShrink: 0 }} />
              <span>{event.time}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
              <MapPin size={13} style={{ color: event.catColor, flexShrink: 0 }} />
              <span>{event.venue}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
              <Users size={13} style={{ color: event.catColor, flexShrink: 0 }} />
              <span>{event.org}</span>
            </div>
          </div>

          {/* Advantages */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
            {event.advantages.map((adv) => (
              <span
                key={adv}
                style={{
                  padding: "3px 10px",
                  borderRadius: "16px",
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.15)",
                  fontSize: "0.7rem",
                  color: "#10b981",
                }}
              >
                ✓ {adv}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "0.76rem", color: "var(--muted-foreground)" }}>
                {isDemo ? "Sample Event" : "Live Event"}
              </span>
              {!isDemo && event.isOngoing && (
                <span style={{
                  padding: "3px 10px",
                  borderRadius: "16px",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  color: "#ef4444",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite" }} />
                  LIVE
                </span>
              )}
              <ShareButton
                eventName={event.name}
                eventDescription={event.description}
                eventSlug={event.slug}
                eventDate={event.startDate}
                eventVenue={event.venue}
                eventFee={event.fee}
                isDemo={isDemo}
              />
            </div>
            {isDemo ? (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="btn-primary"
                style={{ padding: "8px 18px", fontSize: "0.82rem", borderRadius: "10px", border: "none", cursor: "pointer" }}
              >
                Register →
              </button>
            ) : (
              <Link
                href={`/events/${event.slug}/register`}
                className="btn-primary"
                style={{ padding: "8px 18px", fontSize: "0.82rem", borderRadius: "10px" }}
              >
                Register →
              </Link>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <DemoRegistrationModal event={event} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

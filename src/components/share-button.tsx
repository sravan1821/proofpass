"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { buildPublicUrl, isLocalhostLikeUrl } from "@/lib/public-url";

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function NativeShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

interface ShareButtonProps {
  eventName: string;
  eventDescription?: string;
  eventSlug: string;
  eventDate?: string;
  eventVenue?: string;
  eventFee?: number | string | null;
  isDemo?: boolean;
  /** "icon" = small icon-only button, "full" = labeled button */
  variant?: "icon" | "full";
}

export default function ShareButton({
  eventName,
  eventDescription,
  eventSlug,
  eventDate,
  eventVenue,
  eventFee,
  variant = "icon",
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; openAbove: boolean }>({ top: 0, left: 0, openAbove: true });
  const popoverRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const eventPath = `/events/${eventSlug}/register`;

  const shareUrl =
    typeof window !== "undefined"
      ? buildPublicUrl(eventPath, window.location.origin)
      : buildPublicUrl(eventPath);
  const shareUrlNeedsNetworkHint = isLocalhostLikeUrl(shareUrl);

  const shareText = [
    `🎯 ${eventName}`,
    eventDescription ? `\n${eventDescription.slice(0, 120)}${eventDescription.length > 120 ? "…" : ""}` : "",
    eventDate ? `\n📅 ${eventDate}` : "",
    eventVenue ? `\n📍 ${eventVenue}` : "",
    eventFee && Number(eventFee) > 0 ? `\n💰 ₹${eventFee}` : "\n🎟️ FREE",
    `\n\nRegister now 👉 ${shareUrl}`,
    `\n\n— via ProofPass`,
  ].join("");

  // Calculate popover position when opened
  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const popoverHeight = 340; // approx height of popover
    const popoverWidth = 220;
    const spaceAbove = rect.top;
    const openAbove = spaceAbove > popoverHeight + 12;

    let top: number;
    if (openAbove) {
      top = rect.top - popoverHeight - 8 + window.scrollY;
    } else {
      top = rect.bottom + 8 + window.scrollY;
    }

    // Align to the right edge of the button but clamp to viewport
    let left = rect.right - popoverWidth + window.scrollX;
    if (left < 8) left = 8;
    if (left + popoverWidth > window.innerWidth - 8) {
      left = window.innerWidth - popoverWidth - 8;
    }

    setPopoverPos({ top, left, openAbove });
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on scroll
  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, [open]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventName,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // user cancelled
      }
    }
    setOpen(false);
  }, [eventName, shareText, shareUrl]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const openWhatsApp = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
    setOpen(false);
  };

  const openTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `🎯 ${eventName}`
      )}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
    setOpen(false);
  };

  const openEmail = () => {
    window.open(
      `mailto:?subject=${encodeURIComponent(
        `Check out: ${eventName}`
      )}&body=${encodeURIComponent(shareText)}`,
      "_self"
    );
    setOpen(false);
  };

  const openLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
    setOpen(false);
  };

  const togglePopover = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen((v) => !v);
  };

  const popoverContent = open && typeof document !== "undefined" ? createPortal(
    <div
      ref={popoverRef}
      className="share-popover"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: `${popoverPos.top}px`,
        left: `${popoverPos.left}px`,
        zIndex: 9999,
        minWidth: "220px",
        padding: "8px",
        borderRadius: "16px",
        background: "rgba(12, 21, 42, 0.96)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(143, 220, 255, 0.14)",
        boxShadow:
          "0 24px 80px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255,255,255,0.03) inset",
        animation: "sharePopoverIn 0.2s ease forwards",
      }}
    >
      <p
        style={{
          fontSize: "0.68rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--muted-foreground)",
          padding: "6px 10px 8px",
          margin: 0,
          opacity: 0.7,
        }}
      >
        Share this event
      </p>

      {shareUrlNeedsNetworkHint ? (
        <p
          style={{
            fontSize: "0.74rem",
            lineHeight: 1.5,
            color: "var(--muted-foreground)",
            padding: "0 10px 8px",
            margin: 0,
          }}
        >
          This link still points to localhost. Set `NEXT_PUBLIC_APP_URL` to your LAN IP to share it with other devices.
        </p>
      ) : null}

      {/* Copy Link */}
      <button
        onClick={copyLink}
        className="share-option-btn"
        style={shareOptionStyle}
      >
        <span
          style={{
            ...shareIconWrapperStyle,
            background: copied ? "rgba(16,185,129,0.15)" : "rgba(143,220,255,0.08)",
            color: copied ? "var(--success)" : "var(--primary-soft)",
          }}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </span>
        <span style={{ color: copied ? "var(--success)" : "var(--foreground)" }}>
          {copied ? "Link Copied!" : "Copy Link"}
        </span>
      </button>

      {/* WhatsApp */}
      <button
        onClick={openWhatsApp}
        className="share-option-btn"
        style={shareOptionStyle}
      >
        <span style={{ ...shareIconWrapperStyle, background: "rgba(37,211,102,0.12)", color: "#25d366" }}>
          <WhatsAppIcon />
        </span>
        <span>WhatsApp</span>
      </button>

      {/* Twitter / X */}
      <button
        onClick={openTwitter}
        className="share-option-btn"
        style={shareOptionStyle}
      >
        <span style={{ ...shareIconWrapperStyle, background: "rgba(255,255,255,0.08)", color: "var(--foreground)" }}>
          <TwitterIcon />
        </span>
        <span>X (Twitter)</span>
      </button>

      {/* LinkedIn */}
      <button
        onClick={openLinkedIn}
        className="share-option-btn"
        style={shareOptionStyle}
      >
        <span style={{ ...shareIconWrapperStyle, background: "rgba(10,102,194,0.15)", color: "#0a66c2" }}>
          <LinkedInIcon />
        </span>
        <span>LinkedIn</span>
      </button>

      {/* Email */}
      <button
        onClick={openEmail}
        className="share-option-btn"
        style={shareOptionStyle}
      >
        <span style={{ ...shareIconWrapperStyle, background: "rgba(245,158,11,0.12)", color: "var(--accent-warm)" }}>
          <EmailIcon />
        </span>
        <span>Email</span>
      </button>

      {/* Native Share (mobile) */}
      {typeof navigator !== "undefined" && "share" in navigator && (
        <>
          <div
            style={{
              height: "1px",
              background: "rgba(255,255,255,0.06)",
              margin: "4px 8px",
            }}
          />
          <button
            onClick={handleNativeShare}
            className="share-option-btn"
            style={shareOptionStyle}
          >
            <span style={{ ...shareIconWrapperStyle, background: "rgba(88,115,255,0.12)", color: "var(--primary)" }}>
              <NativeShareIcon />
            </span>
            <span>More Options…</span>
          </button>
        </>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <button
        ref={btnRef}
        onClick={togglePopover}
        id={`share-btn-${eventSlug}`}
        aria-label={`Share ${eventName}`}
        className="share-trigger-btn"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: variant === "icon" ? "8px" : "7px 14px",
          borderRadius: variant === "icon" ? "10px" : "999px",
          border: "1px solid rgba(143, 220, 255, 0.12)",
          background: "rgba(255, 255, 255, 0.04)",
          color: "var(--muted-foreground)",
          cursor: "pointer",
          fontSize: "0.78rem",
          fontWeight: 600,
          transition: "all 0.22s ease",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <ShareIcon />
        {variant === "full" && <span>Share</span>}
      </button>

      {popoverContent}
    </div>
  );
}

const shareOptionStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  width: "100%",
  padding: "8px 10px",
  border: "none",
  borderRadius: "10px",
  background: "transparent",
  color: "var(--foreground)",
  fontSize: "0.82rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "background 0.15s ease",
  textAlign: "left",
};

const shareIconWrapperStyle: React.CSSProperties = {
  width: "30px",
  height: "30px",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

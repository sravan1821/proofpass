import Link from "next/link";

const FEATURES = [
  {
    icon: "🛡️",
    title: "Tamper-Proof Certificates",
    desc: "Every certificate carries a unique ID and embedded QR code. Verification happens in real-time — no calls, no emails, no guesswork.",
    color: "#818cf8",
  },
  {
    icon: "📝",
    title: "Dynamic Form Builder",
    desc: "Collect participant data with a drag-and-drop form builder inspired by Google Forms. 14+ field types, real-time preview, zero learning curve.",
    color: "#10b981",
  },
  {
    icon: "🏆",
    title: "Achievement-Based Templates",
    desc: "Distinct certificate designs for Winners, Runners-Up, and Participants. Every achievement level gets the recognition it deserves.",
    color: "#f59e0b",
  },
  {
    icon: "🔒",
    title: "Curated Trust Model",
    desc: "Every organizer is vetted and approved before they can issue certificates. No unverified issuers, no credential fraud.",
    color: "#3b82f6",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Register & Get Approved",
    desc: "Submit your organization details. Our team verifies and approves your account within 24 hours.",
    color: "#818cf8",
  },
  {
    num: "02",
    title: "Create Events & Collect Data",
    desc: "Set up your event, build registration forms, and collect participant data — all in one place.",
    color: "#10b981",
  },
  {
    num: "03",
    title: "Issue Verified Certificates",
    desc: "Categorize participants, configure templates, and issue tamper-evident certificates with unique QR codes in bulk.",
    color: "#f59e0b",
  },
];

const STATS = [
  { value: "< 3s", label: "Verification Time" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "14+", label: "Form Field Types" },
  { value: "3", label: "Certificate Tiers" },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ── NAVBAR ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(99,102,241,0.08)",
          background: "rgba(7,11,23,0.8)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "14px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              P
            </div>
            <span className="font-bold text-lg">ProofPass</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/verify/search"
              style={{
                fontSize: "0.9rem",
                color: "var(--muted-foreground)",
                padding: "8px 16px",
              }}
            >
              Verify Certificate
            </Link>
            <Link
              href="/sign-in"
              className="btn-secondary"
              style={{ padding: "8px 20px", fontSize: "0.875rem" }}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="btn-primary"
              style={{ padding: "8px 20px", fontSize: "0.875rem" }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          paddingTop: "140px",
          paddingBottom: "100px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "600px",
            background:
              "radial-gradient(ellipse, rgba(79,70,229,0.2) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "100px",
            right: "10%",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "0 24px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "20px",
              background: "rgba(79,70,229,0.1)",
              border: "1px solid rgba(79,70,229,0.2)",
              fontSize: "0.8rem",
              color: "var(--primary-soft)",
              marginBottom: "24px",
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--success)",
                display: "inline-block",
              }}
            />
            Trusted Event Credential Infrastructure
          </div>

          <h1
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "20px",
              letterSpacing: "-0.02em",
            }}
          >
            Every Certificate{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #818cf8, #4f46e5, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Verified.
            </span>
            <br />
            Every Achievement{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #f59e0b, #d97706)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Recognized.
            </span>
          </h1>

          <p
            style={{
              fontSize: "1.15rem",
              color: "var(--muted-foreground)",
              maxWidth: "600px",
              margin: "0 auto 36px",
              lineHeight: 1.7,
            }}
          >
            ProofPass is the end-to-end platform for event credential management
            — from organizer onboarding and participant registration to tamper-evident
            certificate issuance with real-time QR-based verification.
          </p>

          <div
            className="flex items-center justify-center"
            style={{ gap: "14px", flexWrap: "wrap" }}
          >
            <Link
              href="/register"
              className="btn-primary"
              style={{
                padding: "14px 32px",
                fontSize: "1rem",
                borderRadius: "12px",
              }}
            >
              Register as Organizer →
            </Link>
            <Link
              href="/verify/search"
              className="btn-secondary"
              style={{
                padding: "14px 32px",
                fontSize: "1rem",
                borderRadius: "12px",
              }}
            >
              🔍 Verify a Certificate
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto 80px",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1px",
            background: "var(--border)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "var(--surface)",
                padding: "28px 20px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  color: "var(--primary-soft)",
                  marginBottom: "4px",
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--muted-foreground)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto 100px",
          padding: "0 24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--primary-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            Platform Capabilities
          </p>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            Built for Trust, Designed for Speed
          </h2>
          <p
            style={{
              color: "var(--muted-foreground)",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            Everything event organizers need to issue credentials that employers,
            universities, and the world can trust.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px",
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass-card glass-card-hover"
              style={{ padding: "32px", cursor: "default" }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: `${f.color}15`,
                  border: `1px solid ${f.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.4rem",
                  marginBottom: "16px",
                }}
              >
                {f.icon}
              </div>
              <h3
                className="font-bold"
                style={{ fontSize: "1.1rem", marginBottom: "8px" }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  color: "var(--muted-foreground)",
                  lineHeight: 1.7,
                  fontSize: "0.9rem",
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        style={{
          maxWidth: "1000px",
          margin: "0 auto 100px",
          padding: "0 24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--primary-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            How It Works
          </p>
          <h2 style={{ fontSize: "2rem", fontWeight: 700 }}>
            Three Steps to Verified Credentials
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
          }}
        >
          {STEPS.map((step) => (
            <div key={step.num} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: `${step.color}12`,
                  border: `2px solid ${step.color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: step.color,
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  margin: "0 auto 16px",
                  fontFamily: "var(--font-ibm-plex-mono), monospace",
                }}
              >
                {step.num}
              </div>
              <h3
                className="font-bold"
                style={{ fontSize: "1.05rem", marginBottom: "8px" }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  color: "var(--muted-foreground)",
                  fontSize: "0.88rem",
                  lineHeight: 1.6,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VERIFICATION DEMO ── */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto 100px",
          padding: "0 24px",
        }}
      >
        <div
          className="glass-card"
          style={{
            padding: "48px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              width: "300px",
              height: "300px",
              background:
                "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--success)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            Instant Verification
          </p>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            Verify Any Certificate in Seconds
          </h2>
          <p
            style={{
              color: "var(--muted-foreground)",
              marginBottom: "28px",
              maxWidth: "500px",
              display: "inline-block",
              lineHeight: 1.7,
            }}
          >
            Scan the QR code on any ProofPass certificate or enter the Certificate
            ID to instantly check its authenticity. No login required.
          </p>

          <div
            style={{
              display: "flex",
              gap: "10px",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            <input
              type="text"
              placeholder="Enter Certificate ID (e.g., PP-2025-TF-00001)"
              className="input-field"
              style={{ flex: 1 }}
              readOnly
            />
            <Link
              href="/verify/search"
              className="btn-primary"
              style={{ padding: "12px 24px", whiteSpace: "nowrap" }}
            >
              Verify →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          textAlign: "center",
          padding: "80px 24px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "12px",
          }}
        >
          Ready to Issue Trusted Credentials?
        </h2>
        <p
          style={{
            color: "var(--muted-foreground)",
            marginBottom: "28px",
            maxWidth: "500px",
            display: "inline-block",
          }}
        >
          Join the platform that makes every certificate verifiable and every
          achievement distinguishable.
        </p>
        <div>
          <Link
            href="/register"
            className="btn-primary"
            style={{
              padding: "14px 36px",
              fontSize: "1rem",
              borderRadius: "12px",
            }}
          >
            Register Your Organization →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "32px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: "0.75rem",
              }}
            >
              P
            </div>
            <span
              style={{
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "var(--muted-foreground)",
              }}
            >
              ProofPass
            </span>
          </div>
          <div
            className="flex items-center"
            style={{ gap: "24px", fontSize: "0.85rem" }}
          >
            <Link
              href="/sign-in"
              style={{ color: "var(--muted-foreground)" }}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              style={{ color: "var(--muted-foreground)" }}
            >
              Register
            </Link>
            <Link
              href="/verify/search"
              style={{ color: "var(--muted-foreground)" }}
            >
              Verify
            </Link>
            <Link
              href="/admin/login"
              style={{ color: "var(--muted-foreground)", opacity: 0.5 }}
            >
              Admin
            </Link>
          </div>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--muted-foreground)",
              opacity: 0.6,
            }}
          >
            © {new Date().getFullYear()} ProofPass. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

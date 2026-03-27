import type { CertificateRecord, EventRecord, ProjectRecord, TeamMember } from "@/types/domain";

const event: EventRecord = {
  id: "event-hackfusion-2026",
  name: "HackFusion 2026",
  slug: "hackfusion-2026",
  venue: "JNTUH Innovation Hall",
  startDate: "2026-03-12",
  endDate: "2026-03-14",
  status: "active",
};

const contributions: TeamMember[] = [
  {
    id: "member-1",
    displayName: "Rahul Sharma",
    roleTitle: "Product Lead",
    initials: "RS",
    accent: "#4f46e5",
    approvalStatus: "approved",
    contributionSummary: "Defined recruiter mode, certificate flow, and live demo sequence.",
  },
  {
    id: "member-2",
    displayName: "Priya Reddy",
    roleTitle: "UI Engineer",
    initials: "PR",
    accent: "#db2777",
    approvalStatus: "approved",
    contributionSummary: "Built the public verification surface and responsive landing story.",
  },
  {
    id: "member-3",
    displayName: "Arun Kumar",
    roleTitle: "Full Stack Engineer",
    initials: "AK",
    accent: "#059669",
    approvalStatus: "approved",
    contributionSummary: "Implemented Supabase-backed certificate issuance, revoke flow, and audit logs.",
  },
];

const project: ProjectRecord = {
  id: "project-proofpass",
  slug: "proofpass",
  title: "ProofPass",
  abstract:
    "A verified talent passport that turns a hackathon certificate into a QR-powered trust surface for judges, recruiters, and organizers.",
  longDescription:
    "ProofPass links each issued certificate to a public verification page, a portfolio-grade project profile, and organizer-approved contribution cards. The product is designed for high-signal demo moments: scan the QR, verify the certificate, review the project, and contact the team without leaving the flow.",
  techStack: [
    "Next.js App Router",
    "TypeScript",
    "Tailwind CSS",
    "shadcn/ui",
    "Supabase",
    "Vercel",
    "Resend",
  ],
  links: [
    { label: "GitHub Repository", href: "https://github.com/example/proofpass" },
    { label: "Live Demo", href: "https://proofpass-demo.vercel.app" },
    { label: "Pitch Deck", href: "https://example.com/proofpass-deck" },
  ],
  assets: [
    { title: "Verify State", caption: "Mobile-first trust surface with active and revoked states." },
    { title: "Contribution Passport", caption: "Organizer-approved role cards attached to the certificate." },
    { title: "Organizer Dashboard", caption: "Events, teams, issue, revoke, and audit view in one flow." },
  ],
};

export const certificates: CertificateRecord[] = [
  {
    id: "cert-active",
    token: "active-demo-token",
    serialNumber: "PP-HF26-0312",
    status: "active",
    issuedAt: "2026-03-14T10:30:00.000Z",
    participantName: "ProofNinjas",
    teamName: "ProofNinjas",
    event,
    project,
    approvedContributions: contributions,
    recruiterSummary:
      "Team of three with product, UI, and full-stack ownership clearly approved by the organizer.",
  },
  {
    id: "cert-revoked",
    token: "revoked-demo-token",
    serialNumber: "PP-HF26-0224",
    status: "revoked",
    issuedAt: "2026-03-13T14:15:00.000Z",
    revokedAt: "2026-03-14T08:05:00.000Z",
    revokeReason: "Project links were updated after judging and must be reissued.",
    participantName: "ProofNinjas",
    teamName: "ProofNinjas",
    event,
    project,
    approvedContributions: contributions,
    recruiterSummary:
      "Revoked sample record for demo contrast and trust-story validation.",
  },
];

export const dashboardStats = [
  { label: "Certificates Issued", value: "1,284", trend: "+12%" },
  { label: "Verifications", value: "3,426", trend: "+24%" },
  { label: "Organizations", value: "48", trend: "+8%" },
  { label: "Recruiter Leads", value: "126", trend: "+31%" },
];

export const hackathonHighlights = [
  "QR verification, revocation, and recruiter mode in one demo path",
  "Organizer-approved contribution passport as the core differentiator",
  "Single web app architecture aligned to the ProofPass v2 blueprint",
];

export const demoFlow = [
  {
    step: "01",
    title: "Prepare the event",
    detail: "Organizer creates HackFusion 2026, adds the team, and reviews contribution claims before publishing.",
  },
  {
    step: "02",
    title: "Issue with proof attached",
    detail: "Certificate issuance creates serial number, public token, and a verification route that links back to the project.",
  },
  {
    step: "03",
    title: "Verify and recruit",
    detail: "Judges and recruiters land on a trust page with project summary, approved roles, and a fast contact flow.",
  },
];

export const teamSnapshot = [
  { name: "ProofNinjas", role: "Team", status: "Ready for issue" },
  { name: "Rahul Sharma", role: "Product Lead", status: "Approved" },
  { name: "Priya Reddy", role: "UI Engineer", status: "Approved" },
  { name: "Arun Kumar", role: "Full Stack Engineer", status: "Approved" },
];

export const recruiterLeads = [
  { company: "Vertex Labs", contact: "Nisha Verma", note: "Interested in internship pipeline demo." },
  { company: "T-Hub Network", contact: "Aman Shah", note: "Requested follow-up on team contribution passport." },
];

export const recentAuditEvents = [
  "certificate.issued for PP-HF26-0312",
  "contribution.approved for Arun Kumar",
  "recruiter_lead.created from Vertex Labs",
  "certificate.revoked for PP-HF26-0224",
];

export function getCertificateByToken(token: string) {
  return certificates.find((certificate) => certificate.token === token) ?? null;
}

export function getProjectBySlug(slug: string) {
  return slug === project.slug ? project : null;
}

export const seedProject = project;
export const seedEvent = event;

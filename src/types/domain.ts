export type CertificateStatus = "active" | "revoked" | "draft" | "not_found";
export type ContributionStatus = "approved" | "pending";

export interface TeamMember {
  id: string;
  displayName: string;
  roleTitle: string;
  initials: string;
  accent: string;
  approvalStatus: ContributionStatus;
  contributionSummary: string;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface ProjectAsset {
  title: string;
  caption: string;
}

export interface ProjectRecord {
  id: string;
  slug: string;
  title: string;
  abstract: string;
  longDescription: string;
  techStack: string[];
  links: ProjectLink[];
  assets: ProjectAsset[];
}

export interface EventRecord {
  id: string;
  name: string;
  slug: string;
  venue: string;
  startDate: string;
  endDate: string;
  status: "draft" | "active" | "completed";
}

export interface CertificateRecord {
  id: string;
  token: string;
  serialNumber: string;
  status: CertificateStatus;
  issuedAt: string;
  revokedAt?: string;
  revokeReason?: string;
  participantName: string;
  teamName: string;
  event: EventRecord;
  project: ProjectRecord;
  approvedContributions: TeamMember[];
  recruiterSummary: string;
}

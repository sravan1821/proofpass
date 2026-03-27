import { findProfile } from "@/lib/auth/mongo";
import { clearUserSession, getUserSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export type UserRole = "super_admin" | "organizer";
export type ApprovalStatus = "submitted" | "under_review" | "approved" | "rejected" | "suspended" | "revoked";

export interface UserProfile {
  id: string;
  authUserId: string;
  fullName: string;
  email: string;
  role: UserRole;
  orgName: string | null;
  orgLogoUrl: string | null;
  approvalStatus: ApprovalStatus;
}

type RedirectProfile = {
  role: UserRole;
  approval_status: ApprovalStatus;
};

export function getPostSignInRedirect(profile: RedirectProfile): string {
  if (profile.role === "super_admin") {
    return "/admin";
  }

  if (profile.approval_status === "submitted" || profile.approval_status === "under_review") {
    return "/register/pending";
  }

  return "/dashboard";
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const session = await getUserSession();
  if (!session) return null;

  const profile = await findProfile({ auth_user_id: session.userId });

  if (!profile) return null;

  return {
    id: String(profile.id),
    authUserId: session.userId,
    fullName: String(profile.full_name),
    email: String(profile.email),
    role: profile.role as UserRole,
    orgName: (profile.org_name as string | null) ?? null,
    orgLogoUrl: (profile.org_logo_url as string | null) ?? null,
    approvalStatus: profile.approval_status as ApprovalStatus,
  };
}

export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}

export async function requireApprovedOrganizer(): Promise<UserProfile> {
  const user = await requireAuth();
  if (user.role !== "organizer" && user.role !== "super_admin") redirect("/sign-in");
  if (user.role === "organizer" && user.approvalStatus !== "approved") redirect("/register/pending");
  return user;
}

export async function requireAdmin(): Promise<UserProfile> {
  const user = await requireAuth();
  if (user.role !== "super_admin") redirect("/sign-in");
  return user;
}

export async function signOut() {
  await clearUserSession();
  redirect("/sign-in");
}

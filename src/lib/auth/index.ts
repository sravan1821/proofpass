import { createSupabaseServerClient } from "@/lib/db/supabase/server";
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

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    authUserId: user.id,
    fullName: profile.full_name,
    email: profile.email,
    role: profile.role as UserRole,
    orgName: profile.org_name,
    orgLogoUrl: profile.org_logo_url,
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
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/sign-in");
}

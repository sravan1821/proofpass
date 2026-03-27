"use server";

import { createSupabaseServerClient } from "@/lib/db/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function approveApplicationAction(profileId: string) {
  const admin = await requireAdmin();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const { error } = await supabase
    .from("profiles")
    .update({
      approval_status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: admin.id,
    })
    .eq("id", profileId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  return { success: true };
}

export async function rejectApplicationAction(profileId: string, reason: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const { error } = await supabase
    .from("profiles")
    .update({
      approval_status: "rejected",
      approval_notes: reason,
    })
    .eq("id", profileId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  return { success: true };
}

export async function suspendOrganizerAction(profileId: string, reason: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const { error } = await supabase
    .from("profiles")
    .update({
      approval_status: "suspended",
      approval_notes: reason,
    })
    .eq("id", profileId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  return { success: true };
}

export async function revokeOrganizerAction(profileId: string, reason: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const { error } = await supabase
    .from("profiles")
    .update({
      approval_status: "revoked",
      approval_notes: reason,
    })
    .eq("id", profileId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  return { success: true };
}

export async function requestInfoAction(profileId: string, message: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const { error } = await supabase
    .from("profiles")
    .update({
      approval_status: "pending_info",
      approval_notes: message,
    })
    .eq("id", profileId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  return { success: true };
}

export async function approveEventAction(eventId: string, notes?: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const { error } = await supabase
    .from("events")
    .update({
      admin_approval: "approved",
      admin_event_notes: notes || null,
      status: "published",
    })
    .eq("id", eventId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

export async function rejectEventAction(eventId: string, reason: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const { error } = await supabase
    .from("events")
    .update({
      admin_approval: "rejected",
      admin_event_notes: reason,
      status: "draft",
    })
    .eq("id", eventId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

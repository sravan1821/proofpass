"use server";

import { createSupabaseServerClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Service unavailable. Please try again later." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  // Get user profile to determine redirect
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication failed." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, approval_status")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found. Please contact support." };
  }

  if (profile.role === "super_admin") {
    redirect("/admin");
  }

  if (profile.approval_status === "approved") {
    redirect("/dashboard");
  }

  if (profile.approval_status === "submitted" || profile.approval_status === "under_review") {
    redirect("/register/pending");
  }

  if (profile.approval_status === "rejected") {
    return { error: "Your application has been rejected. Please contact support." };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/sign-in");
}

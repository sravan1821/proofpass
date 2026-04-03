"use server";

import { findProfile, verifyPassword } from "@/lib/auth/mongo";
import { createUserSession, clearUserSession } from "@/lib/auth/session";
import { getPostSignInRedirect } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function signInAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Email and password are required." };
    }

    const user = await verifyPassword(email, password);
    if (!user) {
      return { error: "Invalid email or password." };
    }

    const profile = await findProfile({ auth_user_id: user.id });
    if (!profile) {
      return { error: "Profile not found. Please contact support." };
    }

    if (profile.approval_status === "rejected") {
      return { error: "Your application has been rejected. Please contact support." };
    }

    await createUserSession({ id: user.id, email: user.email });

    redirect(
      getPostSignInRedirect({
        role: profile.role as "super_admin" | "organizer",
        approval_status: profile.approval_status as
          | "submitted"
          | "under_review"
          | "approved"
          | "rejected"
          | "suspended"
          | "revoked",
      }),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof Error && error.message.includes("AUTH_SECRET")) {
      return { error: "Authentication is not configured correctly. Set AUTH_SECRET in the deployment environment." };
    }

    return { error: "Unable to sign in right now. Check the deployment environment and database connection." };
  }
}

export async function signOutAction() {
  await clearUserSession();
  redirect("/");
}

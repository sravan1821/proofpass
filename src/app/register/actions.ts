"use server";

import { createAuthUser, findProfile, insertProfile } from "@/lib/auth/mongo";
import { redirect } from "next/navigation";

export async function registerOrganizerAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const orgName = formData.get("orgName") as string;
  const orgType = formData.get("orgType") as string;
  const orgWebsite = formData.get("orgWebsite") as string;
  const phone = formData.get("phone") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const country = formData.get("country") as string;
  const purpose = formData.get("purpose") as string;

  // Validation
  if (!email || !password || !fullName || !orgName || !orgType || !phone || !city || !country || !purpose) {
    return { error: "All required fields must be filled." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (purpose.length < 50) {
    return { error: "Purpose description must be at least 50 characters." };
  }

  const existing = await findProfile({ email: email.toLowerCase() });
  if (existing) {
    return { error: "An application with this email already exists." };
  }

  const { user, error: authError } = await createAuthUser(email, password);
  if (authError) {
    return { error: authError };
  }

  if (!user) {
    return { error: "Service unavailable. Please try again later." };
  }

  const { error: profileError } = await insertProfile({
    auth_user_id: user.id,
    full_name: fullName,
    email: email.toLowerCase(),
    role: "organizer",
    org_name: orgName,
    org_type: orgType,
    org_website: orgWebsite || null,
    phone,
    city,
    state: state || null,
    country,
    purpose,
    approval_status: "submitted",
  });

  if (profileError) {
    return { error: "Failed to save application: " + profileError };
  }

  redirect("/register/success");
}

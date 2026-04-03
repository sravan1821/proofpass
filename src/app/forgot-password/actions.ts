"use server";

import { consumePasswordResetToken, createPasswordResetToken, updateAuthUserPassword } from "@/lib/auth/mongo";

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) {
    return { error: "Email is required." };
  }

  const { resetUrl, error } = await createPasswordResetToken(email);
  if (error) {
    return { error };
  }

  return {
    success: "If that account exists, a reset link has been generated.",
  };
}

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!token) {
    return { error: "Reset token is missing." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const { userId, error: tokenError } = await consumePasswordResetToken(token);
  if (tokenError || !userId) {
    return { error: tokenError || "Reset token is invalid." };
  }

  const { error } = await updateAuthUserPassword(userId, password);
  if (error) {
    return { error };
  }

  return { success: "Password updated. You can now sign in." };
}

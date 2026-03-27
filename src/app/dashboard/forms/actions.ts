"use server";

import { createMongoServerClient } from "@/lib/db/mongo/server";
import { requireApprovedOrganizer } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DEFAULT_FORM_SETTINGS } from "@/lib/form-builder/types";

export async function createFormAction(formData: FormData) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const eventId = formData.get("eventId") as string;

  if (!title) return { error: "Form title is required." };

  const { data, error } = await supabase.from("forms").insert({
    organizer_id: user.id,
    event_id: eventId || null,
    title,
    description: description || null,
    fields_json: [],
    settings_json: DEFAULT_FORM_SETTINGS,
    status: "draft",
  }).select().single();

  if (error) return { error: error.message };

  redirect(`/dashboard/forms/${data.id}/edit`);
}

export async function saveFormAction(formId: string, fieldsJson: unknown[], settingsJson: unknown) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const { error } = await supabase
    .from("forms")
    .update({
      fields_json: fieldsJson,
      settings_json: settingsJson,
      updated_at: new Date().toISOString(),
    })
    .eq("id", formId)
    .eq("organizer_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/forms/${formId}/edit`);
  return { success: true };
}

export async function updateFormMetaAction(formId: string, title: string, description: string) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const { error } = await supabase
    .from("forms")
    .update({ title, description, updated_at: new Date().toISOString() })
    .eq("id", formId)
    .eq("organizer_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/forms/${formId}/edit`);
  return { success: true };
}

export async function publishFormAction(formId: string) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const { error } = await supabase
    .from("forms")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("id", formId)
    .eq("organizer_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/forms/${formId}/edit`);
  revalidatePath("/dashboard/forms");
  return { success: true };
}

export async function closeFormAction(formId: string) {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  const { error } = await supabase
    .from("forms")
    .update({ status: "closed", updated_at: new Date().toISOString() })
    .eq("id", formId)
    .eq("organizer_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/forms/${formId}/edit`);
  revalidatePath("/dashboard/forms");
  return { success: true };
}

export async function submitFormResponseAction(shareId: string, data: Record<string, unknown>) {
  const supabase = await createMongoServerClient();
  if (!supabase) return { error: "Service unavailable" };

  // Get form by share ID
  const { data: form } = await supabase
    .from("forms")
    .select("*")
    .eq("share_id", shareId)
    .eq("status", "published")
    .single();

  if (!form) return { error: "This form is no longer accepting responses." };

  const settings = form.settings_json as Record<string, unknown>;

  // Check response limit
  if (settings.responseLimit && form.response_count >= (settings.responseLimit as number)) {
    return { error: "This form has reached its response limit." };
  }

  // Check one response per email
  if (settings.oneResponsePerEmail && data.email) {
    const { data: existing } = await supabase
      .from("form_responses")
      .select("id")
      .eq("form_id", form.id)
      .filter("data_json->>email", "eq", data.email as string)
      .limit(1);

    if (existing && existing.length > 0) {
      return { error: "You have already submitted a response with this email." };
    }
  }

  // Insert response
  const { error: insertError } = await supabase.from("form_responses").insert({
    form_id: form.id,
    data_json: data,
  });

  if (insertError) return { error: insertError.message };

  // Increment response count
  await supabase.from("forms").update({ response_count: form.response_count + 1 }).eq("id", form.id);

  return { success: true, confirmationMessage: (settings.confirmationMessage as string) || "Thank you!" };
}

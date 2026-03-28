export type FieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "phone"
  | "dropdown"
  | "radio"
  | "checkbox"
  | "date"
  | "time"
  | "file_upload"
  | "number"
  | "rating"
  | "section_header"
  | "image_banner";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  allowOther?: boolean;
  fileTypes?: string[];
  maxFileSize?: number;
  dateFormat?: string;
  timeFormat?: "12h" | "24h";
  ratingScale?: number;
  imageUrl?: string;
  uniqueField?: boolean;
}

export interface FormSettings {
  acceptResponses: boolean;
  responseLimit?: number;
  oneResponsePerEmail: boolean;
  confirmationMessage: string;
  notifyOnSubmission: boolean;
  closedMessage: string;
}

export interface FormSchema {
  id: string;
  organizerId: string;
  eventId?: string;
  title: string;
  description?: string;
  fields: FormField[];
  settings: FormSettings;
  status: "draft" | "published" | "closed";
  shareId: string;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
}

export type FormTemplate = "blank" | "registration" | "check_in" | "feedback";

export const FIELD_TYPE_META: Record<FieldType, { label: string; icon: string; group: string }> = {
  short_text: { label: "Short Text", icon: "text-cursor", group: "Text" },
  long_text: { label: "Long Text", icon: "align-left", group: "Text" },
  email: { label: "Email", icon: "mail", group: "Text" },
  phone: { label: "Phone", icon: "phone", group: "Text" },
  dropdown: { label: "Dropdown", icon: "chevrons-up-down", group: "Choice" },
  radio: { label: "Multiple Choice", icon: "circle-dot", group: "Choice" },
  checkbox: { label: "Checkboxes", icon: "square-check", group: "Choice" },
  date: { label: "Date", icon: "calendar-days", group: "Date & Time" },
  time: { label: "Time", icon: "clock-3", group: "Date & Time" },
  file_upload: { label: "File Upload", icon: "paperclip", group: "Advanced" },
  number: { label: "Number", icon: "hash", group: "Advanced" },
  rating: { label: "Rating", icon: "star", group: "Advanced" },
  section_header: { label: "Section Header", icon: "heading", group: "Layout" },
  image_banner: { label: "Image / Banner", icon: "image", group: "Layout" },
};

export function createDefaultField(type: FieldType): FormField {
  const base: FormField = {
    id: crypto.randomUUID(),
    type,
    label: FIELD_TYPE_META[type].label,
    required: false,
  };

  switch (type) {
    case "dropdown":
    case "radio":
    case "checkbox":
      base.options = ["Option 1", "Option 2"];
      break;
    case "rating":
      base.ratingScale = 5;
      break;
    case "email":
      base.required = true;
      break;
    default:
      break;
  }

  return base;
}

export function buildTemplateFields(template: FormTemplate): FormField[] {
  switch (template) {
    case "registration":
      return [
        {
          id: crypto.randomUUID(),
          type: "short_text",
          label: "Full Name",
          placeholder: "Enter participant full name",
          required: true,
        },
        {
          id: crypto.randomUUID(),
          type: "email",
          label: "Email Address",
          placeholder: "name@example.com",
          required: true,
        },
        {
          id: crypto.randomUUID(),
          type: "phone",
          label: "Phone Number",
          placeholder: "+91 XXXXX XXXXX",
          required: false,
        },
        {
          id: crypto.randomUUID(),
          type: "short_text",
          label: "College / Organization",
          placeholder: "Institution or company name",
          required: false,
        },
        {
          id: crypto.randomUUID(),
          type: "long_text",
          label: "Why do you want to attend?",
          placeholder: "Share context about your interest or goals",
          required: false,
        },
      ];
    case "check_in":
      return [
        {
          id: crypto.randomUUID(),
          type: "short_text",
          label: "Full Name",
          placeholder: "Participant full name",
          required: true,
        },
        {
          id: crypto.randomUUID(),
          type: "email",
          label: "Email Address",
          placeholder: "name@example.com",
          required: true,
        },
        {
          id: crypto.randomUUID(),
          type: "short_text",
          label: "Registration ID",
          placeholder: "Optional ticket or registration code",
          required: false,
        },
      ];
    case "feedback":
      return [
        {
          id: crypto.randomUUID(),
          type: "short_text",
          label: "Full Name",
          placeholder: "Optional",
          required: false,
        },
        {
          id: crypto.randomUUID(),
          type: "rating",
          label: "How would you rate the event?",
          required: true,
          ratingScale: 5,
        },
        {
          id: crypto.randomUUID(),
          type: "long_text",
          label: "What worked well?",
          placeholder: "Share highlights from the experience",
          required: false,
        },
        {
          id: crypto.randomUUID(),
          type: "long_text",
          label: "What should we improve?",
          placeholder: "Tell us what could be better next time",
          required: false,
        },
      ];
    case "blank":
    default:
      return [];
  }
}

export const DEFAULT_FORM_SETTINGS: FormSettings = {
  acceptResponses: true,
  oneResponsePerEmail: false,
  confirmationMessage: "Thank you for your response!",
  notifyOnSubmission: false,
  closedMessage: "This form is no longer accepting responses.",
};

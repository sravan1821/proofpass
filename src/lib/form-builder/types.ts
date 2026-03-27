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
  options?: string[];        // For dropdown, radio, checkbox
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  allowOther?: boolean;      // For dropdown, radio, checkbox
  fileTypes?: string[];      // For file_upload
  maxFileSize?: number;      // In MB
  dateFormat?: string;
  timeFormat?: "12h" | "24h";
  ratingScale?: number;      // 5 or 10
  imageUrl?: string;         // For image_banner
  uniqueField?: boolean;     // Enforce unique values
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

export const FIELD_TYPE_META: Record<FieldType, { label: string; icon: string; group: string }> = {
  short_text: { label: "Short Text", icon: "✏️", group: "Text" },
  long_text: { label: "Long Text", icon: "📝", group: "Text" },
  email: { label: "Email", icon: "📧", group: "Text" },
  phone: { label: "Phone", icon: "📱", group: "Text" },
  dropdown: { label: "Dropdown", icon: "▼", group: "Choice" },
  radio: { label: "Multiple Choice", icon: "◉", group: "Choice" },
  checkbox: { label: "Checkboxes", icon: "☑️", group: "Choice" },
  date: { label: "Date", icon: "📅", group: "Date & Time" },
  time: { label: "Time", icon: "⏰", group: "Date & Time" },
  file_upload: { label: "File Upload", icon: "📎", group: "Advanced" },
  number: { label: "Number", icon: "#", group: "Advanced" },
  rating: { label: "Rating", icon: "⭐", group: "Advanced" },
  section_header: { label: "Section Header", icon: "─", group: "Layout" },
  image_banner: { label: "Image / Banner", icon: "🖼️", group: "Layout" },
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

export const DEFAULT_FORM_SETTINGS: FormSettings = {
  acceptResponses: true,
  oneResponsePerEmail: false,
  confirmationMessage: "Thank you for your response!",
  notifyOnSubmission: false,
  closedMessage: "This form is no longer accepting responses.",
};

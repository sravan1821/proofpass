export interface EventOrganizer {
  org_name?: string | null;
  full_name?: string | null;
  email?: string | null;
}

export interface EventRecord {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  category?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  event_time?: string | null;
  venue_details?: string | null;
  venue?: string | null;
  registration_fee?: number | string | null;
  advantages?: string[] | null;
  org_name_display?: string | null;
  organizer_id?: string | null;
  status?: string | null;
  profiles?: EventOrganizer | null;
}

export interface EventRegistrationRecord {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  college_name?: string | null;
  team_size?: number | null;
  payment_status: "pending" | "paid" | string;
  payment_ref?: string | null;
  receipt_number?: string | null;
  registered_at?: string | null;
  checked_in?: boolean | null;
  checked_in_at?: string | null;
}

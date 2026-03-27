-- ============================================================
-- ProofPass Platform Schema Extension
-- Adds: organizer profiles, forms, form responses, updated certs
-- ============================================================

-- Extend profiles for organizer registration & admin approval
alter table profiles add column if not exists role text not null default 'organizer';
alter table profiles add column if not exists org_name text;
alter table profiles add column if not exists org_type text;
alter table profiles add column if not exists org_website text;
alter table profiles add column if not exists phone text;
alter table profiles add column if not exists city text;
alter table profiles add column if not exists state text;
alter table profiles add column if not exists country text;
alter table profiles add column if not exists purpose text;
alter table profiles add column if not exists supporting_doc_url text;
alter table profiles add column if not exists approval_status text not null default 'submitted';
alter table profiles add column if not exists approval_notes text;
alter table profiles add column if not exists approved_at timestamptz;
alter table profiles add column if not exists approved_by uuid references profiles(id);
alter table profiles add column if not exists org_logo_url text;
alter table profiles add column if not exists primary_color text default '#4f46e5';
alter table profiles add column if not exists secondary_color text default '#818cf8';
alter table profiles add column if not exists auth_user_id uuid unique;

-- Update events for organizer scoping
alter table events add column if not exists organizer_id uuid references profiles(id);
alter table events add column if not exists description text;
alter table events add column if not exists category text default 'other';
alter table events add column if not exists event_mode text default 'in_person';
alter table events add column if not exists venue_details text;
alter table events add column if not exists cover_image_url text;
alter table events add column if not exists expected_participants int;
alter table events add column if not exists event_code text;

-- Forms table (dynamic form builder)
create table if not exists forms (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references profiles(id) on delete cascade,
  event_id uuid references events(id) on delete set null,
  title text not null,
  description text,
  fields_json jsonb not null default '[]'::jsonb,
  settings_json jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  share_id text unique default encode(gen_random_bytes(8), 'hex'),
  response_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('draft', 'published', 'closed'))
);

-- Form responses
create table if not exists form_responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references forms(id) on delete cascade,
  data_json jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  ip_address text,
  source text default 'direct'
);

-- Update certificates for categories and templates
alter table certificates add column if not exists category text default 'participant';
alter table certificates add column if not exists recipient_name text;
alter table certificates add column if not exists recipient_email text;
alter table certificates add column if not exists achievement_detail text;
alter table certificates add column if not exists signatory_names jsonb default '[]'::jsonb;
alter table certificates add column if not exists organization_name text;
alter table certificates add column if not exists organization_logo_url text;
alter table certificates add column if not exists qr_code_data text;
alter table certificates add column if not exists verification_url text;
alter table certificates add column if not exists organizer_id uuid references profiles(id);
alter table certificates add column if not exists certificate_id_display text unique;

-- Participants table (link form responses to events)
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  form_response_id uuid references form_responses(id),
  full_name text not null,
  email text,
  category text not null default 'participant',
  achievement_detail text,
  extra_data jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (category in ('winner', 'runner_up', 'participant'))
);

-- Indexes
create index if not exists idx_forms_organizer_id on forms(organizer_id);
create index if not exists idx_forms_share_id on forms(share_id);
create index if not exists idx_form_responses_form_id on form_responses(form_id);
create index if not exists idx_participants_event_id on participants(event_id);
create index if not exists idx_events_organizer_id on events(organizer_id);
create index if not exists idx_certificates_organizer_id on certificates(organizer_id);
create index if not exists idx_profiles_auth_user_id on profiles(auth_user_id);
create index if not exists idx_profiles_approval_status on profiles(approval_status);

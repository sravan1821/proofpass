create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  college_name text,
  role_label text not null default 'organizer',
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  venue text,
  start_date date,
  end_date date,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  college_name text,
  status text not null default 'active',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  title text not null,
  slug text not null unique,
  abstract text not null,
  tech_stack text,
  demo_url text,
  github_url text,
  deck_url text,
  created_at timestamptz not null default now()
);

create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  profile_id uuid references profiles(id),
  display_name text not null,
  role_title text not null,
  is_lead boolean not null default false,
  approval_status text not null default 'approved',
  created_at timestamptz not null default now()
);

create table if not exists contributions (
  id uuid primary key default gen_random_uuid(),
  team_member_id uuid not null references team_members(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  summary text not null,
  proof_links_json jsonb not null default '[]'::jsonb,
  approval_status text not null default 'pending',
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  serial_number text not null unique,
  token_hash text not null unique,
  status text not null default 'draft',
  issue_email text,
  revoke_reason text,
  issued_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (status in ('draft', 'active', 'revoked'))
);

create table if not exists project_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  asset_type text not null,
  url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists verification_logs (
  id uuid primary key default gen_random_uuid(),
  certificate_id uuid not null references certificates(id) on delete cascade,
  result_status text not null,
  viewed_at timestamptz not null default now(),
  visitor_ip_hash text,
  user_agent_hash text
);

create table if not exists recruiter_leads (
  id uuid primary key default gen_random_uuid(),
  certificate_id uuid not null references certificates(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  recruiter_name text not null,
  company text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references profiles(id),
  action_type text not null,
  entity_type text not null,
  entity_id text not null,
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_team_members_team_id on team_members(team_id);
create index if not exists idx_contributions_project_id on contributions(project_id);
create index if not exists idx_verification_logs_certificate_id_viewed_at on verification_logs(certificate_id, viewed_at desc);

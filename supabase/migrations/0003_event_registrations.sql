-- ============================================================
-- Event Registrations & Enhanced Event Fields
-- ============================================================

-- Add registration & admin-approval columns to events
alter table events add column if not exists registration_fee numeric default 0;
alter table events add column if not exists registration_deadline date;
alter table events add column if not exists event_time text;
alter table events add column if not exists advantages jsonb default '[]'::jsonb;
alter table events add column if not exists admin_approval text not null default 'pending';
alter table events add column if not exists admin_event_notes text;
alter table events add column if not exists org_name_display text;

-- Public event registrations table
create table if not exists event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  college_name text,
  payment_status text not null default 'pending',
  payment_ref text,
  receipt_number text unique,
  registered_at timestamptz not null default now(),
  check (payment_status in ('pending', 'paid'))
);

-- Indexes
create index if not exists idx_event_registrations_event_id on event_registrations(event_id);
create index if not exists idx_events_admin_approval on events(admin_approval);

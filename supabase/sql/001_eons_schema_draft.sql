-- EONS Supabase Schema Draft
-- Status: draft only. Review before running in Supabase.

create table if not exists public.matter_files (
  matter_id uuid primary key default gen_random_uuid(),
  matter_name text not null,
  entity_or_person text,
  tax_year_or_period text,
  issue_type text,
  reviewer text,
  deadline date,
  status text default 'draft',
  created_at_utc timestamptz default now(),
  updated_at_utc timestamptz default now()
);

create table if not exists public.evidence_records (
  record_id uuid primary key default gen_random_uuid(),
  matter_id uuid references public.matter_files(matter_id) on delete set null,
  title text not null,
  entity_or_person text,
  tax_year_or_period text,
  evidence_tier text,
  record_type text,
  source_status text default 'draft',
  review_status text default 'review_required',
  record_hash text,
  chain_of_custody_note text,
  created_at_utc timestamptz default now(),
  updated_at_utc timestamptz default now()
);

create table if not exists public.upload_metadata (
  upload_id uuid primary key default gen_random_uuid(),
  record_id uuid references public.evidence_records(record_id) on delete cascade,
  filename text not null,
  mime_type text,
  size_bytes bigint,
  storage_bucket text,
  storage_path text,
  storage_status text default 'pending_private_storage',
  file_hash text,
  created_at_utc timestamptz default now()
);

create table if not exists public.audit_events (
  audit_id uuid primary key default gen_random_uuid(),
  timestamp_utc timestamptz default now(),
  actor_id uuid,
  actor_role text,
  action_type text not null,
  resource_type text,
  resource_id text,
  result text default 'recorded',
  notes text
);

create table if not exists public.reviewer_notes (
  note_id uuid primary key default gen_random_uuid(),
  record_id uuid references public.evidence_records(record_id) on delete cascade,
  matter_id uuid references public.matter_files(matter_id) on delete set null,
  reviewer_role text,
  reviewer_name text,
  note_text text,
  status text default 'review_required',
  final_approval boolean default false,
  created_at_utc timestamptz default now()
);

-- Enable RLS. Policies below are draft placeholders and must be reviewed before production.
alter table public.matter_files enable row level security;
alter table public.evidence_records enable row level security;
alter table public.upload_metadata enable row level security;
alter table public.audit_events enable row level security;
alter table public.reviewer_notes enable row level security;

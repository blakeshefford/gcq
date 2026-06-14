-- ============================================================================
-- Global Connection Quest — Supabase setup
-- Run this ONCE in your Supabase project:  SQL Editor → New query → paste → Run
-- ============================================================================

-- Single shared key/value table. The app namespaces everything inside `key`
-- (users:*, inbox:*, code:*, score:*, flash:current, …) so one table is enough.
create table if not exists public.kv (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- Fast prefix lookups for slist() (e.g. "inbox:USERID:%", "score:%").
create index if not exists kv_key_prefix_idx on public.kv (key text_pattern_ops);

-- Keep updated_at fresh on every upsert.
create or replace function public.kv_touch() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists kv_touch_trg on public.kv;
create trigger kv_touch_trg before insert or update on public.kv
  for each row execute function public.kv_touch();

-- ---------------------------------------------------------------------------
-- Access. This is an internal event app with no per-user auth, so the public
-- (anon) key is allowed to read/insert/update — but NOT delete. Each write
-- targets a unique key, so concurrent writers never clobber each other.
-- If you want to lock it down after the event, drop the policies below.
-- ---------------------------------------------------------------------------
alter table public.kv enable row level security;

drop policy if exists kv_anon_select on public.kv;
drop policy if exists kv_anon_insert on public.kv;
drop policy if exists kv_anon_update on public.kv;

create policy kv_anon_select on public.kv for select using (true);
create policy kv_anon_insert on public.kv for insert with check (true);
create policy kv_anon_update on public.kv for update using (true) with check (true);

-- Done. Now paste your Project URL + anon key into the HTML file and host it.

-- Optional: wipe everything to start a fresh event (uncomment to use)
-- truncate table public.kv;

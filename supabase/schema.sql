-- My Story: cross-device sync (#3)
-- Run once in the Supabase dashboard → SQL Editor.
-- Safe to re-run.

create table if not exists public.notes (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null default '',
  content     text not null default '',
  created_at  timestamptz not null,
  updated_at  timestamptz not null,   -- time of the last edit (last write wins)
  deleted_at  timestamptz,            -- soft delete (tombstone)
  synced_at   timestamptz not null default now()  -- server time, pull cursor
);

create index if not exists notes_user_synced on public.notes (user_id, synced_at);

-- Server-side rules for every write:
--  * synced_at is always server time, so the pull cursor does not depend on device clocks
--  * an older edit never overwrites a newer one (last write wins by updated_at)
--  * a row never changes owner
create or replace function public.notes_before_write()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    if new.updated_at <= old.updated_at then
      return null;  -- skip: the stored row is newer or the same
    end if;
    new.user_id := old.user_id;
  end if;
  new.synced_at := now();
  return new;
end;
$$;

drop trigger if exists notes_before_write on public.notes;
create trigger notes_before_write
  before insert or update on public.notes
  for each row execute function public.notes_before_write();

-- Table privileges: newer Supabase projects do not grant these automatically
-- for tables created in SQL. Signed-in users only; anon gets nothing.
-- No delete on purpose (deletions are tombstones). RLS below limits rows.
revoke all on public.notes from anon;
grant select, insert, update on public.notes to authenticated;

-- Row Level Security: each user sees and writes only their own notes.
-- No delete policy on purpose: deletions are tombstones (deleted_at).
alter table public.notes enable row level security;

drop policy if exists "own notes: select" on public.notes;
create policy "own notes: select" on public.notes
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "own notes: insert" on public.notes;
create policy "own notes: insert" on public.notes
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "own notes: update" on public.notes;
create policy "own notes: update" on public.notes
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

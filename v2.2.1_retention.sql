-- KASPA Holder Monitor v2.2.1
-- Run once in the Supabase SQL Editor.

grant select, insert, delete on table public.holder_snapshots to service_role;

-- Apply the 120-day policy immediately to rows that already exist.
delete from public.holder_snapshots
where captured_at < now() - interval '120 days';

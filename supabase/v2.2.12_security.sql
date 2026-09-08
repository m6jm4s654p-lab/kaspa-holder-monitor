begin;

-- Remove older duplicates, retaining the newest snapshot for each calendar day in Japan.
with ranked as (
  select id,row_number() over (
    partition by ((captured_at at time zone 'Asia/Tokyo')::date)
    order by captured_at desc,id desc
  ) as row_number
  from public.holder_snapshots
)
delete from public.holder_snapshots
where id in (select id from ranked where row_number>1);

-- Prevent overlapping cron requests from inserting two snapshots for one JST day.
create unique index if not exists holder_snapshots_jst_day_uidx
  on public.holder_snapshots (((captured_at at time zone 'Asia/Tokyo')::date));

alter table public.holder_snapshots enable row level security;
revoke all on table public.holder_snapshots from anon, authenticated;
grant select, insert, delete on table public.holder_snapshots to service_role;

commit;

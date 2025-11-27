set search_path = public;

-- 1) Remove duplicate enabled rows per (user_id, fcm_token), keeping the most recent last_seen
with ranked as (
  select
    id,
    user_id,
    fcm_token,
    row_number() over (
      partition by fcm_token
      order by last_seen desc nulls last, id desc
    ) as rn
  from public.devices
  where fcm_token is not null
)
delete from public.devices d
using ranked r
where d.id = r.id
  and r.rn > 1;

-- 2) Add a unique constraint on fcm_token so each token exists only once
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'devices_fcm_token_unique'
  ) then
    alter table public.devices
      add constraint devices_fcm_token_unique unique (fcm_token);
  end if;
end;
$$;



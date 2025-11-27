set search_path = public;

-- Extend notification_type enum to support chat message notifications
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'notification_type'
      and e.enumlabel = 'message_received'
  ) then
    alter type notification_type add value 'message_received';
  end if;
end;
$$;




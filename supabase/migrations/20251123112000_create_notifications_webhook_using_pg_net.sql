set search_path = public;

-- Webhook: call the existing `push` Edge Function whenever a notification is inserted.
-- This ensures all notification types, including `message_received`, trigger a push.
create or replace function public.notify_push_function()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request_id bigint;
begin
  -- Use project URL directly; `push` has verify_jwt: false so no Authorization header is needed
  select net.http_post(
    url := 'https://glbvyusqksnoyjuztceo.supabase.co/functions/v1/push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'notifications',
      'schema', 'public',
      'record', row_to_json(NEW)
    )
  )
  into v_request_id;

  return NEW;
exception
  when others then
    raise notice '[notify_push_function] failed: %', sqlerrm;
    return NEW;
end;
$$;

drop trigger if exists notify_push_on_notification_insert on public.notifications;

create trigger notify_push_on_notification_insert
after insert on public.notifications
for each row
execute function public.notify_push_function();



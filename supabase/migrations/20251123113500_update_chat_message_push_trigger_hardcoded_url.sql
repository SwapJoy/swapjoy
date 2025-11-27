set search_path = public;

-- Use the project URL directly instead of relying on app.settings.*
-- and omit Authorization header since push-chat-message has verify_jwt: false.
create or replace function public.notify_new_chat_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request_id bigint;
begin
  select net.http_post(
    url := 'https://glbvyusqksnoyjuztceo.supabase.co/functions/v1/push-chat-message',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'chat_messages',
      'schema', 'public',
      'record', row_to_json(NEW)
    )
  )
  into v_request_id;

  return NEW;
exception
  when others then
    raise notice '[notify_new_chat_message] failed: %', sqlerrm;
    return NEW;
end;
$$;

drop trigger if exists notify_new_chat_message on public.chat_messages;

create trigger notify_new_chat_message
after insert on public.chat_messages
for each row
execute function public.notify_new_chat_message();




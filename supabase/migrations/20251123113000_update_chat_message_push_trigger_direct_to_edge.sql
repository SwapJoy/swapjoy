set search_path = public;

-- Update notify_new_chat_message to call the dedicated push-chat-message Edge Function
-- directly on INSERT into chat_messages, without creating a notifications row.
create or replace function public.notify_new_chat_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request_id bigint;
begin
  -- Call the push-chat-message Edge Function via pg_net
  select net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/push-chat-message',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
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

-- Ensure trigger exists (idempotent)
drop trigger if exists notify_new_chat_message on public.chat_messages;

create trigger notify_new_chat_message
after insert on public.chat_messages
for each row
execute function public.notify_new_chat_message();




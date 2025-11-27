set search_path = public;

-- For each new chat_messages row, call the shared `push` Edge Function directly,
-- without inserting a notifications row. The push function already:
-- - Accepts a webhook-style payload { type, table, schema, record }
-- - Computes consolidated badge = unread notifications + unread chats
create or replace function public.notify_new_chat_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_chat record;
  v_sender record;
  v_receiver_id uuid;
  v_sender_name text;
  v_message text;
  v_request_id bigint;
  v_now timestamptz := now();
begin
  -- Fetch chat participants
  select id, offer_id, buyer_id, seller_id
  into v_chat
  from chats
  where id = NEW.chat_id;

  if not found then
    raise notice '[notify_new_chat_message] chat % not found', NEW.chat_id;
    return NEW;
  end if;

  -- Determine receiver (other participant)
  if NEW.sender_id = v_chat.buyer_id then
    v_receiver_id := v_chat.seller_id;
  else
    v_receiver_id := v_chat.buyer_id;
  end if;

  -- Fetch sender profile for display name
  select id, username, first_name, last_name
  into v_sender
  from users
  where id = NEW.sender_id;

  v_sender_name :=
    coalesce(
      nullif(trim(coalesce(v_sender.first_name, '') || ' ' || coalesce(v_sender.last_name, '')), ''),
      v_sender.username,
      'Someone'
    );

  v_message := case
    when NEW.content_type = 'image' then 'Sent you an image'
    when coalesce(trim(NEW.content_text), '') <> '' then NEW.content_text
    else 'Sent you a message'
  end;

  -- Call the shared `push` Edge Function with a synthetic notification record.
  -- Note: we DO NOT insert into notifications table; push will still compute
  -- unreadNotifications from existing rows and unreadChats from chat_messages.
  select net.http_post(
    url := 'https://glbvyusqksnoyjuztceo.supabase.co/functions/v1/push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'notifications',
      'schema', 'public',
      'record', jsonb_build_object(
        'id', gen_random_uuid(),
        'user_id', v_receiver_id,
        'type', 'message_received',
        'title', v_sender_name || ' sent a message',
        'message', v_message,
        'data', jsonb_build_object(
          'chatId', NEW.chat_id,
          'offerId', v_chat.offer_id,
          'senderId', NEW.sender_id
        ),
        'created_at', v_now
      )
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



